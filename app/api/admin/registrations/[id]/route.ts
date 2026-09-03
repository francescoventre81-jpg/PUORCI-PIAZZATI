import { NextResponse } from "next/server";
import { deliverConfirmationEmails } from "@/lib/confirmation";
import { sendCashStatusEmail } from "@/lib/email";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getRegistrationPrice,
  TIME_ZONE,
} from "@/lib/pricing";
import { localDateTimeInZoneToDate } from "@/lib/time-zone";
import { isPaymentSufficient } from "@/lib/payment-validation";

type AdminAction = {
  action?: string;
  scheduled_at?: string;
  time_window?: string;
  notes?: string;
  assigned_organizer?: string;
  amount_paid_eur?: string;
  verified_payment_at?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Operazione non autorizzata." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminAction;
  const admin = createAdminClient();

  try {
    if (body.action === "reward_delivered") {
      const { error } = await admin.rpc("mark_reward_delivered", {
        target_reward_id: id,
        confirming_admin_id: user.id,
      });
      if (error) throw error;
      return NextResponse.json({ message: "Premio segnato come consegnato." });
    }

    if (body.action === "bank_confirmed" || body.action === "bank_rejected") {
      const approved = body.action === "bank_confirmed";
      const amountPaidCents = approved
        ? parseEuroToCents(body.amount_paid_eur)
        : null;
      const verifiedAt =
        approved && body.verified_payment_at
          ? localDateTimeInZoneToDate(body.verified_payment_at, TIME_ZONE)
          : null;
      if (approved && (!amountPaidCents || !verifiedAt)) {
        return NextResponse.json(
          { error: "Importo e data effettiva del bonifico sono obbligatori." },
          { status: 400 },
        );
      }
      if (
        approved &&
        verifiedAt &&
        amountPaidCents &&
        !isPaymentSufficient(
          getRegistrationPrice(verifiedAt).amountCents,
          amountPaidCents,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Importo insufficiente per la quota valida alla data effettiva del bonifico.",
          },
          { status: 400 },
        );
      }
      const { data, error } = await admin.rpc("review_bank_transfer", {
        target_registration_id: id,
        confirming_admin_id: user.id,
        approve_payment: approved,
        confirmed_amount_cents: amountPaidCents,
        verified_payment_at: verifiedAt?.toISOString() ?? null,
      });
      if (error) throw error;
      if (approved) await deliverConfirmationEmails(data ?? {});
      return NextResponse.json({
        message: approved
          ? "Bonifico confermato e iscrizione attivata."
          : "Verifica del bonifico rifiutata.",
      });
    }

    const cashStatuses: Record<string, string> = {
      cash_approved: "approved",
      cash_rejected: "rejected",
      cash_scheduled: "scheduled",
      cash_collected: "collected",
      cash_cancelled: "cancelled",
    };
    const nextStatus = body.action ? cashStatuses[body.action] : undefined;
    if (!nextStatus) {
      return NextResponse.json({ error: "Azione non valida." }, { status: 400 });
    }

    const { data, error } = await admin.rpc("update_cash_pickup", {
      target_registration_id: id,
      confirming_admin_id: user.id,
      next_status: nextStatus,
      scheduled_at_value:
        nextStatus === "scheduled" && body.scheduled_at
          ? localDateTimeInZoneToDate(
              body.scheduled_at,
              TIME_ZONE,
            ).toISOString()
          : null,
      scheduled_time_window_value: body.time_window ?? null,
      schedule_notes_value: body.notes ?? null,
      assigned_organizer_value: body.assigned_organizer ?? null,
      confirmed_amount_cents:
        nextStatus === "collected"
          ? getRegistrationPrice().amountCents
          : null,
    });
    if (error) throw error;

    if (nextStatus === "collected") {
      await deliverConfirmationEmails(data ?? {});
    }
    if (nextStatus === "approved" || nextStatus === "rejected") {
      const { data: registration } = await admin
        .from("registrations")
        .select("email,first_name,amount_due_cents")
        .eq("id", id)
        .single();
      if (registration) {
        await sendCashStatusEmail(
          registration.email,
          registration.first_name,
          nextStatus,
          getRegistrationPrice().amountCents,
        );
      }
    }

    return NextResponse.json({ message: "Richiesta contanti aggiornata." });
  } catch {
    return NextResponse.json(
      { error: "Operazione non completata. Controlla stato e configurazione." },
      { status: 400 },
    );
  }
}

function parseEuroToCents(value?: string) {
  const normalized = value?.trim().replace(",", ".");
  if (!normalized || !/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [euros, decimals = ""] = normalized.split(".");
  return Number(euros) * 100 + Number(decimals.padEnd(2, "0"));
}

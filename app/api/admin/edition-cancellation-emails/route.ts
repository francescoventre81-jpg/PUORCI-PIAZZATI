import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { sendEditionCancellationEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RequestBody = {
  mode?: "test" | "preview" | "send";
  confirmation?: string;
};

type EligibleRegistration = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  payment_method: "paypal" | "instant_bank_transfer" | "cash";
  payment_status: string;
  registration_status: string;
  amount_paid_cents: number | null;
  paid_at: string | null;
  payment_confirmed_at: string | null;
  edition_cancellation_email_sent_at: string | null;
};

function isPaidConfirmed(registration: EligibleRegistration) {
  return (
    registration.payment_status === "paid" &&
    registration.registration_status === "confirmed" &&
    registration.amount_paid_cents !== null &&
    registration.paid_at !== null &&
    registration.payment_confirmed_at !== null
  );
}

function isPendingCash(registration: EligibleRegistration) {
  return (
    registration.payment_method === "cash" &&
    registration.payment_status === "pending" &&
    registration.registration_status === "pending"
  );
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user?.email) {
    return NextResponse.json(
      { error: "Operazione non autorizzata." },
      { status: 403 },
    );
  }

  if (
    !process.env.EMAIL_FROM ||
    (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY)
  ) {
    return NextResponse.json(
      { error: "Il servizio email non è configurato." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as RequestBody;

  if (body.mode === "test") {
    const sent = await sendEditionCancellationEmail({
      email: user.email,
      firstName: "Fanta Puorci",
      paymentMethod: "instant_bank_transfer",
      paymentStatus: "paid",
      isTest: true,
    });
    return NextResponse.json({
      message: sent
        ? "Email di prova inviata esclusivamente all’amministratore."
        : "Invio di prova non riuscito.",
      sent: sent ? 1 : 0,
    });
  }

  if (!body.mode || !["preview", "send"].includes(body.mode)) {
    return NextResponse.json(
      { error: "Conferma esplicita mancante. Nessuna email inviata." },
      { status: 409 },
    );
  }

  const admin = createAdminClient();
  const { data: adminRows, error: adminError } = await admin
    .from("admin_users")
    .select("user_id");
  if (adminError) {
    return NextResponse.json(
      { error: "Verifica amministratori non riuscita." },
      { status: 500 },
    );
  }

  const adminIds = new Set((adminRows ?? []).map((row) => row.user_id));
  const { data, error } = await admin
    .from("registrations")
    .select(
      "id,user_id,email,first_name,payment_method,payment_status,registration_status,amount_paid_cents,paid_at,payment_confirmed_at,edition_cancellation_email_sent_at",
    )
    .in("payment_method", ["paypal", "instant_bank_transfer", "cash"])
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Selezione dei partecipanti non riuscita." },
      { status: 500 },
    );
  }

  const eligible = ((data ?? []) as EligibleRegistration[]).filter(
    (registration) =>
      !adminIds.has(registration.user_id) &&
      (isPaidConfirmed(registration) || isPendingCash(registration)) &&
      registration.edition_cancellation_email_sent_at === null,
  );

  const breakdown = {
    paypal: eligible.filter((row) => row.payment_method === "paypal").length,
    bankTransfer: eligible.filter(
      (row) => row.payment_method === "instant_bank_transfer",
    ).length,
    cashPaid: eligible.filter(
      (row) => row.payment_method === "cash" && isPaidConfirmed(row),
    ).length,
    cashPending: eligible.filter((row) => isPendingCash(row)).length,
  };

  if (body.mode === "preview") {
    return NextResponse.json({
      eligible: eligible.length,
      breakdown,
      alreadySent: ((data ?? []) as EligibleRegistration[]).filter(
        (registration) =>
          !adminIds.has(registration.user_id) &&
          (isPaidConfirmed(registration) || isPendingCash(registration)) &&
          registration.edition_cancellation_email_sent_at !== null,
      ).length,
    });
  }

  if (body.confirmation !== "CONFERMO_INVIO_DEFINITIVO_RIMBORSI") {
    return NextResponse.json(
      { error: "Conferma esplicita mancante. Nessuna email inviata." },
      { status: 409 },
    );
  }

  let sent = 0;
  let failed = 0;

  for (const registration of eligible) {
    const claimedAt = new Date().toISOString();
    let claimQuery = admin
      .from("registrations")
      .update({ edition_cancellation_email_claimed_at: claimedAt })
      .eq("id", registration.id)
      .is("edition_cancellation_email_sent_at", null)
      .is("edition_cancellation_email_claimed_at", null);
    claimQuery = isPendingCash(registration)
      ? claimQuery
          .eq("payment_method", "cash")
          .eq("payment_status", "pending")
          .eq("registration_status", "pending")
      : claimQuery
          .eq("payment_status", "paid")
          .eq("registration_status", "confirmed");
    const { data: claimed } = await claimQuery.select("id");

    if (!claimed?.length) continue;

    try {
      const delivered = await sendEditionCancellationEmail({
        email: registration.email,
        firstName: registration.first_name,
        paymentMethod: registration.payment_method,
        paymentStatus: registration.payment_status as "paid" | "pending",
      });

      if (!delivered) throw new Error("email_not_delivered");

      const completedUpdate: Record<string, string | null> = {
        edition_cancellation_email_claimed_at: null,
        edition_cancellation_email_sent_at: new Date().toISOString(),
      };
      if (isPaidConfirmed(registration)) {
        completedUpdate.refund_status = "refund_pending";
        completedUpdate.refund_method = registration.payment_method;
      }
      await admin
        .from("registrations")
        .update(completedUpdate)
        .eq("id", registration.id)
        .eq("edition_cancellation_email_claimed_at", claimedAt);
      sent += 1;
    } catch {
      await admin
        .from("registrations")
        .update({ edition_cancellation_email_claimed_at: null })
        .eq("id", registration.id)
        .eq("edition_cancellation_email_claimed_at", claimedAt);
      failed += 1;
    }
  }

  return NextResponse.json({
    message: `Comunicazioni inviate: ${sent}. Invii da riprovare: ${failed}.`,
    sent,
    failed,
    breakdown,
  });
}

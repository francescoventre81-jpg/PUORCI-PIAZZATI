import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import {
  createShortCode,
  formatPrice,
  getBankConfiguration,
  getRegistrationPrice,
} from "@/lib/payments";
import { getPublicSiteUrl } from "@/lib/server-site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Accesso richiesto." }, { status: 401 });
  }

  const body = (await request.json()) as {
    registrationId?: string;
    method?: "paypal" | "instant_bank_transfer";
  };
  if (
    !body.registrationId ||
    !body.method ||
    !["paypal", "instant_bank_transfer"].includes(body.method)
  ) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("registrations")
      .select("id,payment_status,registration_status")
      .eq("id", body.registrationId)
      .eq("user_id", user.id)
      .single();
    if (
      !existing ||
      existing.payment_status === "paid" ||
      existing.registration_status === "confirmed"
    ) {
      return NextResponse.json(
        { error: "Il metodo di pagamento non può essere modificato." },
        { status: 403 },
      );
    }

    const bank =
      body.method === "instant_bank_transfer" ? getBankConfiguration() : null;
    const reference =
      body.method === "instant_bank_transfer"
        ? createShortCode("PUORCIPIAZZATI-")
        : null;
    const price = getRegistrationPrice();
    const { error } = await admin
      .from("registrations")
      .update({
        payment_method: body.method,
        payment_status: "pending",
        registration_status: "pending",
        bank_transfer_reference: reference,
        bank_transfer_cro_trn: null,
        bank_transfer_declared_at: null,
        bank_transfer_receipt_path: null,
        paypal_order_id: null,
        paypal_capture_id: null,
        cash_pickup_status: null,
        amount_due_cents: price.amountCents,
        amount_paid_cents: null,
        pricing_tier: price.tier,
        price_calculated_at: price.calculatedAt,
        payment_confirmed_at: null,
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) throw error;

    if (body.method === "paypal") {
      const origin = getPublicSiteUrl();
      const order = await createPayPalOrder(
        existing.id,
        price.amountCents,
        `${origin}/pagamento/paypal`,
        `${origin}/dashboard`,
      );
      await admin
        .from("registrations")
        .update({ paypal_order_id: order.orderId })
        .eq("id", existing.id);
      return NextResponse.json({ approvalUrl: order.approvalUrl });
    }

    return NextResponse.json({
      message: `Metodo aggiornato. Quota da versare: ${formatPrice(price.amountCents)}. Usa la causale ${reference}. IBAN: ${bank?.iban}; intestatario: ${bank?.accountHolder}.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Metodo non aggiornato: controlla la configurazione." },
      { status: 503 },
    );
  }
}

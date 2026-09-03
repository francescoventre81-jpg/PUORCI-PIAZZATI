import { NextResponse } from "next/server";
import { deliverConfirmationEmails } from "@/lib/confirmation";
import {
  getPayPalOrder,
  validateCompletedPayPalOrder,
  verifyPayPalWebhook,
} from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";

type PayPalWebhook = {
  id?: string;
  event_type?: string;
  resource?: {
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  let event: PayPalWebhook;

  try {
    event = JSON.parse(rawBody) as PayPalWebhook;
  } catch {
    return NextResponse.json({ error: "JSON non valido." }, { status: 400 });
  }

  if (!event.id || !event.event_type) {
    return NextResponse.json({ error: "Evento incompleto." }, { status: 400 });
  }

  try {
    if (!(await verifyPayPalWebhook(request.headers, event))) {
      return NextResponse.json({ error: "Firma non valida." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("paypal_webhook_events")
      .select("processed_at")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existing?.processed_at) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await admin.from("paypal_webhook_events").upsert({
      event_id: event.id,
      event_type: event.event_type,
      payload: event,
    });

    if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      await admin
        .from("paypal_webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("event_id", event.id);
      return NextResponse.json({ received: true });
    }

    const orderId =
      event.resource?.supplementary_data?.related_ids?.order_id;
    if (!orderId) {
      throw new Error("Ordine PayPal assente.");
    }

    const { data: registration } = await admin
      .from("registrations")
      .select("id,amount_due_cents")
      .eq("paypal_order_id", orderId)
      .eq("payment_method", "paypal")
      .single();
    if (!registration) {
      throw new Error("Iscrizione PayPal non trovata.");
    }

    const order = await getPayPalOrder(orderId);
    const captureId = validateCompletedPayPalOrder(
      order,
      registration.id,
      registration.amount_due_cents,
    );
    const { data: result, error } = await admin.rpc(
      "finalize_registration_payment",
      {
        target_registration_id: registration.id,
        confirmation_source: "paypal_webhook",
        confirming_admin_id: null,
        provider_order_id: orderId,
        provider_capture_id: captureId,
        confirmed_amount_cents: registration.amount_due_cents,
      },
    );

    if (error) {
      throw error;
    }

    await deliverConfirmationEmails(result ?? {});
    await admin
      .from("paypal_webhook_events")
      .update({
        processed_at: new Date().toISOString(),
        processing_error: null,
      })
      .eq("event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    try {
      const admin = createAdminClient();
      await admin
        .from("paypal_webhook_events")
        .update({
          processing_error:
            error instanceof Error ? error.message.slice(0, 500) : "Errore",
        })
        .eq("event_id", event.id);
    } catch {
      // Il webhook deve comunque rispondere con errore per consentire il retry.
    }

    return NextResponse.json(
      { error: "Evento non elaborato." },
      { status: 500 },
    );
  }
}

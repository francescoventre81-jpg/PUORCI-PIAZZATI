import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { formatPrice } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Accesso richiesto." }, { status: 401 });
  }

  const body = (await request.json()) as { orderId?: string };
  if (!body.orderId) {
    return NextResponse.json({ error: "Ordine mancante." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: registration } = await admin
      .from("registrations")
      .select("id,amount_due_cents")
      .eq("user_id", user.id)
      .eq("payment_method", "paypal")
      .eq("paypal_order_id", body.orderId)
      .single();

    if (!registration) {
      return NextResponse.json({ error: "Ordine non autorizzato." }, { status: 403 });
    }

    await capturePayPalOrder(body.orderId);

    return NextResponse.json({
      message:
        `Pagamento di ${formatPrice(registration.amount_due_cents)} ricevuto da PayPal. L’iscrizione sarà confermata esclusivamente dopo la verifica del webhook.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Non è stato possibile completare il pagamento PayPal." },
      { status: 502 },
    );
  }
}

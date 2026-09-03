import { NextResponse } from "next/server";
import { sendPaymentRequestEmail } from "@/lib/email";
import { createPayPalOrder } from "@/lib/paypal";
import {
  createShortCode,
  formatPrice,
  getRegistrationPrice,
  getBankConfiguration,
  REGISTRATION_CURRENCY,
  type PaymentMethod,
} from "@/lib/payments";
import {
  isReferralCodeFormatValid,
  normalizeReferralCode,
} from "@/lib/referrals";
import {
  REGISTRATIONS_CLOSED,
  REGISTRATIONS_CLOSED_MESSAGE,
} from "@/lib/registration-status";
import { getPublicSiteUrl } from "@/lib/server-site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUser } from "@/lib/supabase/auth";

type RegistrationRequest = {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  phone?: string;
  team_name?: string;
  fantasy_username?: string;
  referral_code_used?: string;
  payment_method?: PaymentMethod;
  privacy_accepted?: boolean;
  rules_accepted?: boolean;
  cash_city?: string;
  cash_province?: string;
  cash_postal_code?: string;
  cash_address?: string;
  cash_street_number?: string;
  cash_locality?: string;
  cash_notes?: string;
  cash_preferred_times?: string;
  cash_contact_phone?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (REGISTRATIONS_CLOSED) {
    return NextResponse.json(
      { error: REGISTRATIONS_CLOSED_MESSAGE },
      { status: 410 },
    );
  }

  const user = await getVerifiedUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Accesso richiesto." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RegistrationRequest;
    const method = body.payment_method;
    const required = [
      body.first_name,
      body.last_name,
      body.birth_date,
      body.phone,
      body.team_name,
      body.fantasy_username,
    ];

    if (
      required.some((value) => !text(value)) ||
      !body.privacy_accepted ||
      !body.rules_accepted ||
      !method ||
      !["paypal", "instant_bank_transfer", "cash"].includes(method)
    ) {
      return NextResponse.json(
        { error: "Completa tutti i campi obbligatori." },
        { status: 400 },
      );
    }

    const cashRequired = [
      body.cash_city,
      body.cash_province,
      body.cash_postal_code,
      body.cash_address,
      body.cash_street_number,
      body.cash_preferred_times,
      body.cash_contact_phone,
    ];
    if (method === "cash" && cashRequired.some((value) => !text(value))) {
      return NextResponse.json(
        { error: "Completa tutti i dati necessari per il ritiro." },
        { status: 400 },
      );
    }

    if (
      method === "paypal" &&
      (!process.env.PAYPAL_CLIENT_ID ||
        !process.env.PAYPAL_CLIENT_SECRET ||
        !process.env.SUPABASE_SECRET_KEY)
    ) {
      return NextResponse.json(
        { error: "PayPal non è ancora configurato dagli organizzatori." },
        { status: 503 },
      );
    }
    if (!process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Il servizio iscrizioni non è ancora configurato." },
        { status: 503 },
      );
    }

    const price = getRegistrationPrice();
    const referralCode = normalizeReferralCode(body.referral_code_used);
    const bankReference =
      method === "instant_bank_transfer"
        ? createShortCode("PUORCIPIAZZATI-")
        : null;
    const bank =
      method === "instant_bank_transfer" ? getBankConfiguration() : null;
    const admin = createAdminClient();

    if (referralCode) {
      if (!isReferralCodeFormatValid(referralCode)) {
        return NextResponse.json(
          { error: "Il codice invito non ha un formato valido." },
          { status: 400 },
        );
      }

      const { data: inviter, error: referralError } = await admin
        .from("registrations")
        .select("id,user_id")
        .eq("personal_referral_code", referralCode)
        .eq("payment_status", "paid")
        .eq("registration_status", "confirmed")
        .maybeSingle();

      if (referralError || !inviter || inviter.user_id === user.id) {
        return NextResponse.json(
          { error: "Il codice invito non è valido o non è ancora attivo." },
          { status: 400 },
        );
      }
    }

    const { data, error } = await admin
      .from("registrations")
      .insert({
        user_id: user.id,
        first_name: text(body.first_name),
        last_name: text(body.last_name),
        birth_date: text(body.birth_date),
        phone: text(body.phone),
        email: user.email,
        team_name: text(body.team_name),
        fantasy_username: text(body.fantasy_username),
        referral_code_used: referralCode || null,
        payment_method: method,
        payment_status: "pending",
        registration_status: "pending",
        personal_referral_code: null,
        privacy_accepted: true,
        rules_accepted: true,
        amount_due_cents: price.amountCents,
        amount_paid_cents: null,
        pricing_tier: price.tier,
        price_calculated_at: price.calculatedAt,
        currency: REGISTRATION_CURRENCY,
        bank_transfer_reference: bankReference,
        cash_pickup_status: method === "cash" ? "requested" : null,
        cash_city: method === "cash" ? text(body.cash_city) : null,
        cash_province: method === "cash" ? text(body.cash_province) : null,
        cash_postal_code:
          method === "cash" ? text(body.cash_postal_code) : null,
        cash_address: method === "cash" ? text(body.cash_address) : null,
        cash_street_number:
          method === "cash" ? text(body.cash_street_number) : null,
        cash_locality: method === "cash" ? text(body.cash_locality) || null : null,
        cash_notes: method === "cash" ? text(body.cash_notes) || null : null,
        cash_preferred_times:
          method === "cash" ? text(body.cash_preferred_times) : null,
        cash_contact_phone:
          method === "cash" ? text(body.cash_contact_phone) : null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error:
            error?.code === "23505"
              ? "Hai già inviato una richiesta di iscrizione."
              : "Non è stato possibile salvare la richiesta.",
        },
        { status: error?.code === "23505" ? 409 : 400 },
      );
    }

    if (method === "paypal") {
      try {
        const origin = getPublicSiteUrl();
        const order = await createPayPalOrder(
          data.id,
          price.amountCents,
          `${origin}/pagamento/paypal`,
          `${origin}/iscrizione?paypal=annullato`,
        );
        const { error: updateError } = await admin
          .from("registrations")
          .update({ paypal_order_id: order.orderId })
          .eq("id", data.id)
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        await safelySendRequestEmail({
          email: user.email,
          firstName: text(body.first_name),
          paymentMethod: method,
          amountDueCents: price.amountCents,
        });

        return NextResponse.json({
          registrationId: data.id,
          paymentMethod: method,
          approvalUrl: order.approvalUrl,
        });
      } catch {
        try {
          const admin = createAdminClient();
          await admin.from("registrations").delete().eq("id", data.id);
        } catch {
          // Se il rollback non riesce, la richiesta resta pending e mai pagata.
        }
        return NextResponse.json(
          {
            error:
              "Richiesta salvata, ma PayPal non è configurato o non è raggiungibile. Contatta gli organizzatori.",
          },
          { status: 503 },
        );
      }
    }

    if (method === "instant_bank_transfer") {
      await safelySendRequestEmail({
        email: user.email,
        firstName: text(body.first_name),
        paymentMethod: method,
        amountDueCents: price.amountCents,
      });
      return NextResponse.json({
        registrationId: data.id,
        paymentMethod: method,
        amount: formatPrice(price.amountCents),
        bank: {
          accountHolder: bank?.accountHolder,
          iban: bank?.iban,
          reference: bankReference,
        },
      });
    }

    await safelySendRequestEmail({
      email: user.email,
      firstName: text(body.first_name),
      paymentMethod: method,
      amountDueCents: price.amountCents,
    });
    return NextResponse.json({
      registrationId: data.id,
      paymentMethod: method,
      message:
        "Richiesta ricevuta. Gli organizzatori verificheranno se il tuo indirizzo è raggiungibile. Non sei ancora ufficialmente iscritto e non devi considerare confermato il ritiro finché non ricevi una comunicazione.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Dati bancari non configurati."
        ? "Il bonifico non è ancora configurato dagli organizzatori."
        : "Richiesta non elaborabile.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

async function safelySendRequestEmail(
  input: Parameters<typeof sendPaymentRequestEmail>[0],
) {
  try {
    await sendPaymentRequestEmail(input);
  } catch {
    // L'email non deve duplicare né annullare una richiesta già salvata.
  }
}

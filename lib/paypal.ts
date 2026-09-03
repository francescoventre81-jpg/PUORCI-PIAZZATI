import {
  REGISTRATION_CURRENCY,
  paypalAmount,
} from "@/lib/payments";
import { isPayPalPaymentValid } from "@/lib/payment-validation";

type PayPalLink = {
  href: string;
  rel: string;
};

type PayPalOrder = {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
};

function getPayPalConfiguration() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT ?? "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("Credenziali PayPal non configurate.");
  }

  if (!["sandbox", "live"].includes(environment)) {
    throw new Error("PAYPAL_ENVIRONMENT deve essere sandbox oppure live.");
  }

  return {
    clientId,
    clientSecret,
    apiBase:
      environment === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com",
  };
}

async function getAccessToken() {
  const { apiBase, clientId, clientSecret } = getPayPalConfiguration();
  const authorization = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal non ha rilasciato un access token.");
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("Access token PayPal assente.");
  }

  return { accessToken: payload.access_token, apiBase };
}

export async function createPayPalOrder(
  registrationId: string,
  amountDueCents: number,
  returnUrl: string,
  cancelUrl: string,
) {
  const { accessToken, apiBase } = await getAccessToken();
  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `registration-${registrationId}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: registrationId,
          amount: {
            currency_code: REGISTRATION_CURRENCY,
            value: paypalAmount(amountDueCents),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "PUORCIPIAZZATI",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });

  const order = (await response.json()) as PayPalOrder;
  const approvalUrl = order.links?.find((link) => link.rel === "payer-action")?.href;

  if (!response.ok || !order.id || !approvalUrl) {
    throw new Error("Impossibile creare l'ordine PayPal.");
  }

  return { orderId: order.id, approvalUrl };
}

export async function capturePayPalOrder(orderId: string) {
  const { accessToken, apiBase } = await getAccessToken();
  const response = await fetch(
    `${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `capture-${orderId}`,
      },
      body: "{}",
    },
  );
  const order = (await response.json()) as PayPalOrder;

  if (!response.ok) {
    throw new Error("PayPal non ha completato il pagamento.");
  }

  return order;
}

export async function getPayPalOrder(orderId: string) {
  const { accessToken, apiBase } = await getAccessToken();
  const response = await fetch(
    `${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error("Ordine PayPal non verificabile.");
  }

  return (await response.json()) as PayPalOrder;
}

export async function verifyPayPalWebhook(
  headers: Headers,
  webhookEvent: unknown,
) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID non configurato.");
  }

  const { accessToken, apiBase } = await getAccessToken();
  const response = await fetch(
    `${apiBase}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    },
  );
  const payload = (await response.json()) as { verification_status?: string };
  return response.ok && payload.verification_status === "SUCCESS";
}

export function validateCompletedPayPalOrder(
  order: PayPalOrder,
  registrationId: string,
  amountDueCents: number,
) {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];

  if (
    !capture ||
    !isPayPalPaymentValid(
      order,
      registrationId,
      amountDueCents,
      REGISTRATION_CURRENCY,
    )
  ) {
    throw new Error("I dati del pagamento PayPal non corrispondono.");
  }

  return capture.id;
}

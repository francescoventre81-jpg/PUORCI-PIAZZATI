"use client";

import { useState } from "react";

export function PaymentMethodSwitch({
  registrationId,
}: {
  registrationId: string;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function change(method: "paypal" | "instant_bank_transfer") {
    setLoading(true);
    const response = await fetch("/api/registrations/payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, method }),
    });
    const data = (await response.json()) as {
      approvalUrl?: string;
      message?: string;
      error?: string;
    };
    if (data.approvalUrl) {
      window.location.assign(data.approvalUrl);
      return;
    }
    setMessage(data.message ?? data.error ?? "Operazione non riuscita.");
    setLoading(false);
    if (response.ok) window.location.reload();
  }

  return (
    <div className="payment-switch">
      <strong>Scegli un altro metodo</strong>
      <div>
        <button disabled={loading} onClick={() => change("paypal")} type="button">
          PayPal
        </button>
        <button
          disabled={loading}
          onClick={() => change("instant_bank_transfer")}
          type="button"
        >
          Bonifico istantaneo
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}

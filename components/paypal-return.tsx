"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export function PayPalReturn({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    orderId ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    orderId
      ? "Stiamo completando l’operazione con PayPal."
      : "Codice ordine PayPal mancante.",
  );

  useEffect(() => {
    if (!orderId) return;

    void fetch("/api/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          message?: string;
          error?: string;
        };
        setMessage(payload.message ?? payload.error ?? "Risposta non valida.");
        setStatus(response.ok ? "success" : "error");
      })
      .catch(() => {
        setMessage("Impossibile comunicare con PayPal. Riprova dalla dashboard.");
        setStatus("error");
      });
  }, [orderId]);

  return (
    <div className="payment-return-card" role="status">
      {status === "loading" ? <LoaderCircle className="spin" /> : null}
      {status === "success" ? <CheckCircle2 /> : null}
      {status === "error" ? <TriangleAlert /> : null}
      <span>PAGAMENTO PAYPAL</span>
      <h1>
        {status === "loading"
          ? "Operazione in corso"
          : status === "success"
            ? "Pagamento ricevuto"
            : "Pagamento non completato"}
      </h1>
      <p>{message}</p>
      <p className="payment-return-note">
        Questa pagina da sola non conferma l&apos;iscrizione: fa fede soltanto
        il webhook PayPal verificato dal server.
      </p>
      <Link className="button button-primary" href="/dashboard">
        Vai alla dashboard
      </Link>
    </div>
  );
}

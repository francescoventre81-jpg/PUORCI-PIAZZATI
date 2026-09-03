"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { PUBLIC_SITE_URL } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/client";
import { TurnstileWidget } from "./turnstile-widget";

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function ResendConfirmationForm() {
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Completa la verifica di sicurezza Turnstile.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        email,
        type: "signup",
        options: {
          captchaToken,
          emailRedirectTo: `${PUBLIC_SITE_URL}/auth/callback?next=/email-confermata`,
        },
      });

      if (resendError) {
        setError(
          getAuthErrorMessage(
            resendError,
            "Non è stato possibile inviare l’email. Controlla l’indirizzo e riprova.",
          ),
        );
        return;
      }

      setSent(true);
    } catch {
      setError("Non è stato possibile inviare l’email. Riprova tra poco.");
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((current) => current + 1);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="form-success auth-success" role="status">
        <MailCheck aria-hidden="true" />
        <h2>Email richiesta</h2>
        <p>
          Se l&apos;account esiste e deve ancora essere confermato, riceverai
          una nuova email. Controlla anche Spam e Promozioni.
        </p>
        <Link className="button button-primary" href="/accedi">
          Torna ad Accedi
        </Link>
      </div>
    );
  }

  return (
    <form className="login-card recovery-card" onSubmit={handleSubmit}>
      <div className="login-icon">
        <MailCheck aria-hidden="true" />
      </div>
      <div>
        <span className="form-kicker">CONFERMA ACCOUNT</span>
        <h2>Reinvia l&apos;email</h2>
        <p className="recovery-intro">
          Inserisci l&apos;email usata durante la registrazione.
        </p>
      </div>
      <label>
        <span>Email</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <div className="turnstile-block compact-turnstile">
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>Verifica di sicurezza</span>
        </div>
        <TurnstileWidget
          key={captchaKey}
          onToken={setCaptchaToken}
          siteKey={turnstileSiteKey}
        />
      </div>
      {error ? (
        <p className="login-message error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="form-submit"
        disabled={loading || !captchaToken || !turnstileSiteKey}
        type="submit"
      >
        {loading ? "INVIO..." : "REINVIA EMAIL DI CONFERMA"}
        <MailCheck size={19} />
      </button>
      <Link className="forgot-link back-link" href="/accedi">
        <ArrowLeft size={15} /> Torna ad Accedi
      </Link>
    </form>
  );
}

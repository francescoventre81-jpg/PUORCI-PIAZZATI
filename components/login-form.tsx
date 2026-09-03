"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "./password-field";
import { TurnstileWidget } from "./turnstile-widget";

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function LoginForm() {
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("errore");
    const success = params.get("messaggio");

    if (error === "conferma") {
      setMessageKind("error");
      setMessage(
        "Il link di conferma non è valido o è scaduto. Richiedi una nuova email.",
      );
    } else if (success === "password-aggiornata") {
      setMessageKind("success");
      setMessage("Password aggiornata. Ora puoi accedere.");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageKind("error");
    setNeedsConfirmation(false);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!captchaToken) {
      setMessage("Completa la verifica di sicurezza Turnstile.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });

      if (error) {
        setNeedsConfirmation(
          error.message.toLowerCase().includes("email not confirmed"),
        );
        setMessage(
          getAuthErrorMessage(error, "Email o password non corretti."),
        );
        return;
      }

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setNeedsConfirmation(true);
        setMessage("Devi confermare l’indirizzo email prima di accedere.");
        return;
      }

      setMessageKind("success");
      setMessage("Accesso riuscito. Apertura dell’area personale...");
      window.location.assign("/dashboard");
    } catch {
      setMessage("Impossibile effettuare l’accesso. Riprova.");
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((current) => current + 1);
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="login-icon">
        <LockKeyhole aria-hidden="true" />
      </div>
      <div>
        <span className="form-kicker">AREA RISERVATA</span>
        <h2>Accedi al tuo account</h2>
      </div>
      <label>
        <span>Email</span>
        <input
          aria-describedby={message ? "login-feedback" : undefined}
          aria-invalid={messageKind === "error" && Boolean(message)}
          autoComplete="email"
          name="email"
          required
          type="email"
        />
      </label>
      <PasswordField
        aria-describedby={message ? "login-feedback" : undefined}
        aria-invalid={messageKind === "error" && Boolean(message)}
        autoComplete="current-password"
        label="Password"
        name="password"
        required
      />
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
      {message ? (
        <p
          className={`login-message ${messageKind}`}
          id="login-feedback"
          role={messageKind === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
      {needsConfirmation ? (
        <Link className="auth-help-link" href="/reinvia-conferma">
          Non hai ricevuto l&apos;email? Inviala di nuovo
        </Link>
      ) : null}
      <button
        className="form-submit"
        disabled={loading || !captchaToken || !turnstileSiteKey}
        type="submit"
      >
        {loading ? "ACCESSO..." : "ACCEDI"} <ArrowRight size={19} />
      </button>
      <Link className="forgot-link" href="/password-dimenticata">
        Password dimenticata?
      </Link>
      <p className="signup-prompt">
        Non hai ancora un account?{" "}
        <Link href="/registrati">Registrati ora.</Link>
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck, UserPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import {
  isReferralCodeFormatValid,
  normalizeReferralCode,
} from "@/lib/referrals";
import { PUBLIC_SITE_URL } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "./password-field";
import { TurnstileWidget } from "./turnstile-widget";

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function SignupForm() {
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const passwordsDiffer =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  useEffect(() => {
    const code = normalizeReferralCode(
      new URLSearchParams(window.location.search).get("ref"),
    );
    if (isReferralCodeFormatValid(code)) {
      setReferralCode(code);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("first_name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (password !== passwordConfirmation) {
      setError("Le due password non coincidono.");
      return;
    }

    if (!captchaToken) {
      setError("Completa la verifica di sicurezza Turnstile.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          emailRedirectTo: `${PUBLIC_SITE_URL}/auth/callback?next=/email-confermata`,
          data: {
            first_name: firstName,
            last_name: lastName,
            privacy_accepted: true,
            referral_code_used: referralCode || null,
          },
        },
      });

      if (signUpError) {
        setError(
          getAuthErrorMessage(
            signUpError,
            "Impossibile creare l’account. Controlla i dati e riprova.",
          ),
        );
        return;
      }

      if (data.session) {
        await supabase.auth.signOut();
      }

      form.reset();
      setPassword("");
      setPasswordConfirmation("");
      setSubmittedEmail(email);
    } catch {
      setError("Impossibile completare la registrazione. Riprova.");
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((current) => current + 1);
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="form-success auth-success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <h2>Controlla la tua email</h2>
        <p>
          Abbiamo inviato il link di conferma a <strong>{submittedEmail}</strong>.
          L&apos;area personale resterà bloccata finché l&apos;indirizzo non
          sarà verificato.
        </p>
        {referralCode ? (
          <p>
            Codice invito collegato: <strong>{referralCode}</strong>
          </p>
        ) : null}
        <Link className="button button-primary" href="/accedi">
          Vai alla pagina di accesso
        </Link>
        <Link className="auth-help-link" href="/reinvia-conferma">
          Non è arrivata? Reinvia l&apos;email di conferma
        </Link>
      </div>
    );
  }

  return (
    <form className="sport-form signup-form" onSubmit={handleSubmit}>
      <div className="form-intro">
        <span>CREA IL TUO ACCOUNT</span>
        <p>Email verificata obbligatoria.</p>
      </div>

      {referralCode ? (
        <div className="referral-detected" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          Codice invito <strong>{referralCode}</strong> rilevato e conservato.
        </div>
      ) : null}

      <div className="form-grid">
        <label>
          <span>Nome *</span>
          <input
            autoComplete="given-name"
            name="first_name"
            required
            type="text"
          />
        </label>
        <label>
          <span>Cognome *</span>
          <input
            autoComplete="family-name"
            name="last_name"
            required
            type="text"
          />
        </label>
        <label className="form-field-wide">
          <span>Email *</span>
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <PasswordField
          autoComplete="new-password"
          label="Password *"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          value={password}
        />
        <PasswordField
          aria-describedby={passwordsDiffer ? "password-match-error" : undefined}
          aria-invalid={passwordsDiffer}
          autoComplete="new-password"
          label="Conferma password *"
          minLength={8}
          name="password_confirmation"
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          required
          value={passwordConfirmation}
        />
        {passwordsDiffer ? (
          <p
            className="field-error form-field-wide"
            id="password-match-error"
            role="alert"
          >
            Le due password non coincidono.
          </p>
        ) : null}
      </div>

      <div className="consent-list">
        <label>
          <input name="privacy" required type="checkbox" />
          <span>
            <i aria-hidden="true" />
            Accetto l&apos;informativa privacy *
          </span>
        </label>
      </div>

      <div className="turnstile-block">
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
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="form-submit"
        disabled={
          loading || passwordsDiffer || !captchaToken || !turnstileSiteKey
        }
        type="submit"
      >
        {loading ? "CREAZIONE ACCOUNT..." : "CREA ACCOUNT"}
        <UserPlus size={19} />
      </button>
    </form>
  );
}

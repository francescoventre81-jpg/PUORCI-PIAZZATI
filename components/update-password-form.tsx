"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "./password-field";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const passwordsDiffer =
    confirmation.length > 0 && password !== confirmation;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("Le due password non coincidono.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes("different")
            ? "La nuova password deve essere diversa da quella precedente."
            : "Non è stato possibile aggiornare la password. Richiedi un nuovo link.",
        );
        return;
      }

      await supabase.auth.signOut();
      router.push("/accedi?messaggio=password-aggiornata");
      router.refresh();
    } catch {
      setError("Non è stato possibile aggiornare la password. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card recovery-card" onSubmit={handleSubmit}>
      <div className="login-icon">
        <KeyRound aria-hidden="true" />
      </div>
      <div>
        <span className="form-kicker">NUOVA PASSWORD</span>
        <h2>Scegli una nuova password</h2>
        <p className="recovery-intro">
          Usa almeno 8 caratteri e non condividere la password con nessuno.
        </p>
      </div>
      <PasswordField
        autoComplete="new-password"
        label="Nuova password"
        minLength={8}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        value={password}
      />
      <PasswordField
        aria-describedby={passwordsDiffer ? "new-password-match-error" : undefined}
        aria-invalid={passwordsDiffer}
        autoComplete="new-password"
        label="Conferma nuova password"
        minLength={8}
        name="password_confirmation"
        onChange={(event) => setConfirmation(event.target.value)}
        required
        value={confirmation}
      />
      {passwordsDiffer ? (
        <p className="field-error" id="new-password-match-error" role="alert">
          Le due password non coincidono.
        </p>
      ) : null}
      {error ? (
        <p className="login-message error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="form-submit"
        disabled={loading || passwordsDiffer}
        type="submit"
      >
        {loading ? "AGGIORNAMENTO..." : "SALVA NUOVA PASSWORD"}
        <KeyRound size={19} />
      </button>
    </form>
  );
}

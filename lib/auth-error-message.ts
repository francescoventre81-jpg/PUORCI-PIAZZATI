type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

export function getAuthErrorMessage(
  error: AuthErrorLike,
  fallback: string,
) {
  const value = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (
    error.status === 429 ||
    value.includes("rate limit") ||
    value.includes("over_email_send_rate_limit")
  ) {
    return "Il servizio email ha raggiunto il limite temporaneo di invio. Attendi alcuni minuti prima di riprovare.";
  }

  if (
    value.includes("error sending confirmation email") ||
    value.includes("error sending recovery email") ||
    value.includes("email_send_failed") ||
    value.includes("smtp")
  ) {
    return "Supabase non riesce a spedire l’email: la configurazione del servizio email deve essere corretta dall’amministratore.";
  }

  if (value.includes("email not confirmed")) {
    return "Devi confermare l’indirizzo email prima di accedere.";
  }

  if (
    value.includes("invalid login credentials") ||
    value.includes("invalid credentials")
  ) {
    return "Email o password non corretti.";
  }

  if (value.includes("captcha")) {
    return "La verifica di sicurezza è scaduta o non valida. Completala nuovamente.";
  }

  if (value.includes("password") && value.includes("weak")) {
    return "La password non è abbastanza sicura. Usa almeno 8 caratteri.";
  }

  if (
    value.includes("user already registered") ||
    value.includes("email_exists")
  ) {
    return "Esiste già un account con questa email. Accedi oppure recupera la password.";
  }

  return fallback;
}

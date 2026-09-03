import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const columns = [
  "ID iscrizione",
  "Data richiesta",
  "Nome",
  "Cognome",
  "Email",
  "Telefono",
  "Nome squadra",
  "Username Fantacalcio",
  "Metodo pagamento",
  "Stato pagamento",
  "Stato iscrizione",
  "Importo dovuto (EUR)",
  "Importo pagato (EUR)",
  "Fascia prezzo",
  "Pagamento confermato il",
  "Codice referral personale",
  "Codice invito utilizzato",
  "Amici confermati",
  "Causale bonifico",
  "CRO/TRN",
  "Stato ritiro contanti",
] as const;

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return Response.json(
      { error: "Operazione non autorizzata." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("registrations")
    .select(
      "id,created_at,first_name,last_name,email,phone,team_name,fantasy_username,payment_method,payment_status,registration_status,amount_due_cents,amount_paid_cents,pricing_tier,payment_confirmed_at,paid_at,personal_referral_code,referral_code_used,bank_transfer_reference,bank_transfer_cro_trn,cash_pickup_status",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: "Impossibile generare il file delle iscrizioni." },
      { status: 500 },
    );
  }

  const registrations = data ?? [];
  const confirmedByReferralCode = new Map<string, number>();

  for (const registration of registrations) {
    const usedCode = normalizeCode(registration.referral_code_used);
    if (
      usedCode &&
      registration.payment_status === "paid" &&
      registration.registration_status === "confirmed"
    ) {
      confirmedByReferralCode.set(
        usedCode,
        (confirmedByReferralCode.get(usedCode) ?? 0) + 1,
      );
    }
  }

  const rows = registrations.map((registration) => [
    registration.id,
    registration.created_at,
    registration.first_name,
    registration.last_name,
    registration.email,
    registration.phone,
    registration.team_name,
    registration.fantasy_username,
    registration.payment_method,
    registration.payment_status,
    registration.registration_status,
    centsToEuro(registration.amount_due_cents),
    centsToEuro(registration.amount_paid_cents),
    registration.pricing_tier,
    registration.payment_confirmed_at ?? registration.paid_at,
    registration.personal_referral_code,
    registration.referral_code_used,
    confirmedByReferralCode.get(
      normalizeCode(registration.personal_referral_code),
    ) ?? 0,
    registration.bank_transfer_reference,
    registration.bank_transfer_cro_trn,
    registration.cash_pickup_status,
  ]);

  const csv = [columns, ...rows]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="puorcipiazzati-iscrizioni-${date}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function normalizeCode(value: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function centsToEuro(value: number | null) {
  if (value === null) return "";
  return (value / 100).toFixed(2).replace(".", ",");
}

function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);

  // Evita che Excel interpreti dati controllati dagli utenti come formule.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  return `"${text.replaceAll('"', '""')}"`;
}

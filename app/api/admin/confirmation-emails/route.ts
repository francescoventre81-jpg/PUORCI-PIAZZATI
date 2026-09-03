import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { deliverConfirmationEmails } from "@/lib/confirmation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json(
      { error: "Operazione non autorizzata." },
      { status: 403 },
    );
  }

  if (
    !process.env.EMAIL_FROM ||
    (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY)
  ) {
    return NextResponse.json(
      { error: "Il servizio email delle conferme non è ancora configurato." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("registrations")
    .select("id")
    .eq("payment_status", "paid")
    .eq("registration_status", "confirmed")
    .is("confirmation_email_sent_at", null)
    .not("personal_referral_code", "is", null)
    .order("payment_confirmed_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: "Non è stato possibile cercare le email mancanti." },
      { status: 500 },
    );
  }

  let sent = 0;
  let failed = 0;

  for (const registration of data ?? []) {
    try {
      const result = await deliverConfirmationEmails({
        registration_id: registration.id,
      });
      if (result.confirmationSent) sent += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({
    message:
      sent || failed
        ? `Email inviate: ${sent}. Invii da riprovare: ${failed}.`
        : "Tutti gli iscritti confermati hanno già ricevuto il codice.",
    sent,
    failed,
  });
}

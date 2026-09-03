import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { PaymentMethodSwitch } from "@/components/payment-method-switch";
import { ReferralShare } from "@/components/referral-share";
import { formatPrice, getRegistrationPrice } from "@/lib/pricing";
import { getVerifiedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard",
  description: "Area personale PUORCIPIAZZATI.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getVerifiedUser();
  if (!user) redirect("/accedi");

  const supabase = await createClient();
  const { data: registration } = await supabase
    .from("registrations")
    .select(
      "id,created_at,payment_method,payment_status,registration_status,personal_referral_code,bank_transfer_reference,cash_pickup_status,cash_scheduled_at,cash_scheduled_time_window,amount_due_cents,amount_paid_cents,pricing_tier,payment_confirmed_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: referralRows } = registration
    ? await supabase.rpc("get_my_referral_summary")
    : { data: null };
  const referral = referralRows?.[0];
  const { data: adminMembership } = await supabase.rpc("is_admin", {
    candidate_user_id: user.id,
  });

  const firstName =
    typeof user.user_metadata.first_name === "string"
      ? user.user_metadata.first_name
      : "Fantallenatore";
  const currentPrice = getRegistrationPrice();

  return (
    <section className="dashboard-shell">
      <div className="container dashboard-topbar">
        <div>
          <span>AREA PERSONALE</span>
          <h1>Ciao, {firstName}</h1>
        </div>
        <div className="dashboard-top-actions">
          {adminMembership === true ? (
            <Link className="dashboard-admin-link" href="/admin">
              Pannello admin
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </div>

      <div className="container dashboard-grid">
        <article className="dashboard-card account-card">
          <div className="dashboard-card-icon">
            <UserRound />
          </div>
          <span>IL TUO ACCOUNT</span>
          <h2>{user.email}</h2>
          <p>
            <BadgeCheck size={18} />
            Email verificata
          </p>
        </article>

        {!registration ? (
          <article className="dashboard-card action-card">
            <span>PROSSIMO PASSO</span>
            <h2>Completa l&apos;iscrizione alla stagione</h2>
            <p>
              {currentPrice.tier === "early_bird"
                ? `Quota promozionale: ${formatPrice(currentPrice.amountCents)} fino al 10 agosto 2026.`
                : `Quota di iscrizione: ${formatPrice(currentPrice.amountCents)}.`}
            </p>
            <Link className="button button-primary" href="/iscrizione">
              Vai al modulo <ArrowRight size={18} />
            </Link>
          </article>
        ) : (
          <article className="dashboard-card payment-status-card">
            <span>STATO ISCRIZIONE</span>
            <h2>
              {registration.registration_status === "confirmed"
                ? "Iscrizione confermata"
                : "In attesa del pagamento"}
            </h2>
            <div className={`big-status ${registration.payment_status}`}>
              {registration.payment_status === "paid"
                ? "PAGATO"
                : registration.payment_status === "rejected"
                  ? "VERIFICA RIFIUTATA"
                  : "PAGAMENTO IN ATTESA"}
            </div>
            <p>
              <ShieldCheck size={18} />
              La richiesta è valida soltanto quando pagamento e iscrizione sono
              confermati.
            </p>
            <p className="dashboard-detail">
              {registration.payment_status === "paid"
                ? `Pagamento confermato: ${formatPrice(registration.amount_paid_cents ?? registration.amount_due_cents)}`
                : `Quota attualmente dovuta: ${formatPrice(
                    registration.payment_method === "paypal"
                      ? registration.amount_due_cents
                      : currentPrice.amountCents,
                  )}`}
            </p>
            <RegistrationDetail registration={registration} />
            {(registration.cash_pickup_status === "rejected" ||
              registration.payment_status === "rejected") &&
            registration.payment_status !== "paid" ? (
              <PaymentMethodSwitch registrationId={registration.id} />
            ) : null}
          </article>
        )}
      </div>

      {registration ? (
        <div className="container referral-dashboard">
          <article>
            <Gift />
            <span>PORTA 5 AMICI</span>
            <h2>{referral?.confirmed_friends ?? 0} / 5</h2>
            <p>Amici con pagamento e iscrizione confermati</p>
            <small>
              Richieste in attesa: {referral?.pending_requests ?? 0}
            </small>
          </article>
          <article>
            <Trophy />
            <span>PREMIO MAGLIA</span>
            <h2>
              {referral?.reward_unlocked
                ? "Premio raggiunto"
                : "Non ancora raggiunto"}
            </h2>
            {referral?.reward_code ? (
              <strong>{referral.reward_code}</strong>
            ) : (
              <p>Il codice premio apparirà qui al quinto amico confermato.</p>
            )}
          </article>
          <article>
            <ShieldCheck />
            <span>IL TUO CODICE</span>
            {registration.personal_referral_code ? (
              <>
                <ReferralShare code={registration.personal_referral_code} />
                <p>
                  Condividi il codice o il link. L&apos;amico sarà conteggiato
                  soltanto dopo il pagamento confermato.
                </p>
              </>
            ) : (
              <>
                <h2>Non disponibile</h2>
                <p>
                  Viene generato soltanto dopo la conferma effettiva del tuo
                  pagamento.
                </p>
              </>
            )}
          </article>
        </div>
      ) : null}
    </section>
  );
}

function RegistrationDetail({
  registration,
}: {
  registration: {
    payment_method: string;
    bank_transfer_reference?: string | null;
    cash_pickup_status?: string | null;
    cash_scheduled_at?: string | null;
    cash_scheduled_time_window?: string | null;
  };
}) {
  if (registration.payment_method === "instant_bank_transfer") {
    return (
      <p className="dashboard-detail">
        Causale: <strong>{registration.bank_transfer_reference}</strong>
      </p>
    );
  }
  if (registration.payment_method === "cash") {
    const messages: Record<string, string> = {
      requested:
        "Richiesta ricevuta. Gli organizzatori stanno verificando la zona.",
      approved:
        "La tua zona è raggiungibile. Sarai contattato per concordare il ritiro.",
      rejected:
        "La zona non è raggiungibile. Scegli PayPal o bonifico istantaneo.",
      scheduled: "Ritiro programmato.",
      collected: "Incasso confermato.",
      cancelled: "Richiesta annullata.",
    };
    return (
      <p className="dashboard-detail">
        {messages[registration.cash_pickup_status ?? ""] ??
          "Richiesta in lavorazione."}
        {registration.cash_scheduled_at
          ? ` ${new Date(registration.cash_scheduled_at).toLocaleString("it-IT")}`
          : ""}
        {registration.cash_scheduled_time_window
          ? ` — ${registration.cash_scheduled_time_window}`
          : ""}
      </p>
    );
  }
  return null;
}

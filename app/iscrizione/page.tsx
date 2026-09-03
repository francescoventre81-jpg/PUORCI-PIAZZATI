import { redirect } from "next/navigation";
import { PublicPageHero } from "@/components/public-page-hero";
import { RegistrationForm } from "@/components/registration-form";
import {
  getRegistrationPrice,
  STANDARD_PRICE_EUR,
  STANDARD_PRICE_START,
} from "@/lib/pricing";
import {
  isReferralCodeFormatValid,
  normalizeReferralCode,
} from "@/lib/referrals";
import {
  REGISTRATIONS_CLOSED,
  REGISTRATIONS_CLOSED_MESSAGE,
} from "@/lib/registration-status";
import { getVerifiedUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Iscrizione",
  description: "Invia la tua richiesta di iscrizione a PUORCIPIAZZATI.",
};

export const dynamic = "force-dynamic";

export default async function IscrizionePage() {
  if (REGISTRATIONS_CLOSED) {
    return (
      <>
        <PublicPageHero
          description="L’edizione attuale di PUORCIPIAZZATI non prenderà il via. Grazie a tutti per l’interesse e la fiducia."
          eyebrow="Comunicazione importante"
          number="03"
          title="ISCRIZIONI CHIUSE"
        />
        <section className="public-section form-section">
          <div className="container narrow-container">
            <div className="form-card" style={{ textAlign: "center" }}>
              <span className="section-tag">PUORCIPIAZZATI</span>
              <h2>{REGISTRATIONS_CLOSED_MESSAGE}</h2>
              <p>
                Continueremo a lavorare sul progetto per tornare più grandi e
                organizzati.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  const user = await getVerifiedUser();

  if (!user) {
    redirect("/registrati?next=/iscrizione");
  }

  const firstName =
    typeof user.user_metadata.first_name === "string"
      ? user.user_metadata.first_name
      : "";
  const lastName =
    typeof user.user_metadata.last_name === "string"
      ? user.user_metadata.last_name
      : "";
  const referralCode = normalizeReferralCode(
    user.user_metadata.referral_code_used,
  );
  const price = getRegistrationPrice();

  return (
    <>
      <PublicPageHero
        description="Compila il modulo per richiedere il tuo posto nella stagione 2026/2027."
        eyebrow="Entra in partita"
        number="03"
        title="ISCRIZIONE"
      />
      <section className="public-section form-section">
        <div className="container narrow-container">
          <RegistrationForm
            initialFirstName={firstName}
            initialLastName={lastName}
            initialPrice={price}
            initialReferralCode={
              isReferralCodeFormatValid(referralCode) ? referralCode : ""
            }
            standardPriceEur={STANDARD_PRICE_EUR}
            standardPriceStart={STANDARD_PRICE_START}
            verifiedEmail={user.email ?? ""}
          />
        </div>
      </section>
    </>
  );
}

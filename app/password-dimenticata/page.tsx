import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { PublicPageHero } from "@/components/public-page-hero";

export const metadata = {
  title: "Password dimenticata",
  description: "Recupera l’accesso al tuo account PUORCIPIAZZATI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PasswordDimenticataPage() {
  return (
    <>
      <PublicPageHero
        description="Ricevi via email un collegamento sicuro per scegliere una nuova password."
        eyebrow="Recupero account"
        number="06"
        title="PASSWORD DIMENTICATA"
      />
      <section className="public-section login-section">
        <div className="container login-container">
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}

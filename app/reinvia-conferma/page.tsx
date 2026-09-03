import { PublicPageHero } from "@/components/public-page-hero";
import { ResendConfirmationForm } from "@/components/resend-confirmation-form";

export const metadata = {
  title: "Reinvia email di conferma",
  description: "Richiedi una nuova email di conferma PUORCIPIAZZATI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReinviaConfermaPage() {
  return (
    <>
      <PublicPageHero
        description="Richiedi un nuovo collegamento per verificare il tuo indirizzo email."
        eyebrow="Conferma account"
        number="08"
        title="REINVIA EMAIL"
      />
      <section className="public-section login-section">
        <div className="container login-container">
          <ResendConfirmationForm />
        </div>
      </section>
    </>
  );
}

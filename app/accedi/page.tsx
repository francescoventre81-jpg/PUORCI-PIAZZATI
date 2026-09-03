import { LoginForm } from "@/components/login-form";
import { PublicPageHero } from "@/components/public-page-hero";

export const metadata = {
  title: "Accedi",
  description: "Accedi all'area riservata PUORCIPIAZZATI.",
};

export default function AccediPage() {
  return (
    <>
      <PublicPageHero
        description="Accedi con l’indirizzo email verificato per entrare nella tua area personale."
        eyebrow="Area riservata"
        number="04"
        title="ACCEDI"
      />
      <section className="public-section login-section">
        <div className="container login-container">
          <LoginForm />
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Registrati",
  description: "Crea il tuo account verificato PUORCIPIAZZATI.",
  alternates: {
    canonical: "/registrati",
  },
};

export default function RegistratiPage() {
  return (
    <>
      <section className="public-section form-section">
        <div className="container narrow-container">
          <div className="signup-welcome">
            <div className="signup-welcome-logo">
              <Image
                alt="Logo PUORCIPIAZZATI"
                height={180}
                priority
                src="/puorcipiazzati-logo.png"
                unoptimized
                width={180}
              />
            </div>
            <div className="signup-welcome-copy">
              <span>BENVENUTO IN PUORCIPIAZZATI</span>
              <h1>IL CALCIO CAMBIA PROSPETTIVA</h1>
              <p>
                Crea il tuo profilo, conferma l&apos;email ed entra nella nuova
                piattaforma dedicata a calcio, fantacalcio, dati e strumenti.
              </p>
              <div className="signup-steps" aria-label="Passaggi per registrarsi">
                <span><strong>01</strong> Crea l&apos;account</span>
                <span><strong>02</strong> Conferma l&apos;email</span>
                <span><strong>03</strong> Entra nel portale</span>
              </div>
            </div>
          </div>
          <SignupForm />
        </div>
      </section>
    </>
  );
}

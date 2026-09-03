import { AlertCircle, Trophy } from "lucide-react";
import { PriceNotice } from "@/components/price-notice";
import { PublicPageHero } from "@/components/public-page-hero";

const prizes = [
  "iPhone 17 Pro Max",
  "PlayStation 5 Pro + GTA 6",
  "MacBook Neo",
  "AirPods Pro 3",
  "Buono Amazon da 150 €",
];

export const metadata = {
  title: "Premi",
  description: "I premi ufficiali PUORCIPIAZZATI.",
  alternates: {
    canonical: "/premi",
  },
};

export const dynamic = "force-dynamic";

export default function PremiPage() {
  return (
    <>
      <PublicPageHero
        description="Cinque posizioni, cinque premi. Ogni giornata conta."
        eyebrow="Stagione 2026/2027"
        number="01"
        title="I PREMI PUORCIPIAZZATI"
      />
      <section className="public-section">
        <div className="container">
          <aside className="important-note">
            <AlertCircle aria-hidden="true" />
            <p>
              ⚠️ I premi esposti si riferiscono al raggiungimento di almeno 100
              partecipanti.
            </p>
          </aside>
        </div>
        <div className="container">
          <PriceNotice />
        </div>
        <div className="container prizes-list">
          {prizes.map((prize, index) => (
            <article
              className="prize-row"
              data-position={String(index + 1).padStart(2, "0")}
              key={prize}
            >
              <span className="prize-position">{index + 1}°</span>
              <span className="prize-icon">
                <Trophy aria-hidden="true" />
              </span>
              <div>
                <small>{index + 1}° PREMIO</small>
                <h2>{prize}</h2>
              </div>
            </article>
          ))}
        </div>
        <div className="container">
          <aside className="important-note">
            <AlertCircle aria-hidden="true" />
            <p>
              Il valore e il numero dei premi potranno aumentare in base al
              numero complessivo degli iscritti.
            </p>
            <p>
              I premi pubblicati sono garantiti al raggiungimento di almeno 100
              partecipanti. Qualora il numero degli iscritti fosse inferiore,
              il montepremi e i premi potranno essere rideterminati in modo
              proporzionale al numero effettivo dei partecipanti.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

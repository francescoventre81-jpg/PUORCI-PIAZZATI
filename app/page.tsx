import type { Metadata } from "next";
import { Heart, Sparkles } from "lucide-react";
import { DailyAdviceGrid, LatestNews } from "@/components/home/editorial-sections";
import { MatchCard } from "@/components/home/match-card";
import { PortalHero } from "@/components/home/portal-hero";
import { SourceComparison } from "@/components/home/source-comparison";
import {
  EDITORIAL_UPDATED_AT,
  editorialNews,
  upcomingMatches,
} from "@/lib/editorial-data";
import { getPublishedAdvice, getPublishedArticles } from "@/lib/editorial-content";

export const metadata: Metadata = {
  title: "PUORCIPIAZZATI: calcio, fantacalcio e probabili formazioni",
  description:
    "PUORCIPIAZZATI è il portale italiano per probabili formazioni, consigli fantacalcio, calciomercato, statistiche e confronto tra fonti.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [managedArticles, managedAdvice] = await Promise.all([
    getPublishedArticles(),
    getPublishedAdvice(),
  ]);
  const displayedNews = managedArticles.length ? managedArticles : editorialNews;
  return (
    <div className="portal-home">
      <PortalHero />

      <div className="portal-brand-rail" aria-label="Aree del portale">
        <div className="portal-brand-rail-track">
          <span>CALCIO</span><i />
          <span>FANTACALCIO</span><i />
          <span>PROBABILI FORMAZIONI</span><i />
          <span>CALCIOMERCATO</span><i />
          <span>STATISTICHE</span><i />
          <span>ANALISI</span>
        </div>
      </div>

      <section className="portal-section portal-matches" id="probabili-formazioni">
        <div className="container">
          <SectionHeading
            eyebrow="Prossima giornata"
            title="Probabili formazioni"
            description="Apri ogni partita per vedere gli undici probabili, i calciatori a disposizione e gli assenti da monitorare."
          />
          <div className="portal-demo-note">
            Dati reali · Fonte: Lega Serie A · Ultimo aggiornamento: {EDITORIAL_UPDATED_AT}
          </div>
          <div className="match-card-grid">
            {upcomingMatches.map((match) => (
              <MatchCard key={`${match.homeTeam}-${match.awayTeam}`} {...match} />
            ))}
          </div>
        </div>
      </section>

      <section className="portal-section portal-intelligence" id="confronto-fonti">
        <div className="container portal-intelligence-single">
          <SourceComparison />
        </div>
      </section>

      <section className="portal-section portal-advice" id="consigli">
        <div className="container">
          <SectionHeading
            eyebrow="Scelte di formazione"
            title="Consigli di giornata"
            description="Cinque categorie, una lettura immediata. Analisi pensate per trasformare le informazioni in scelte utili."
          />
          <DailyAdviceGrid items={managedAdvice} />
        </div>
      </section>

      <section className="portal-section portal-news-section" id="news">
        <div className="container">
          <SectionHeading
            eyebrow="Aggiornamenti"
            title="Ultime news"
            description="Analisi originali PUORCIPIAZZATI: più fonti, conseguenze concrete e un punto di vista utilizzabile. Le fonti consultate restano sempre verificabili."
          />
          <LatestNews items={displayedNews} />
        </div>
      </section>

      <section className="portal-future-league" id="chi-siamo">
        <div className="portal-pitch-lines" aria-hidden="true" />
        <div className="container portal-about-grid">
          <article className="portal-about-card">
            <div className="future-league-icon" aria-hidden="true">
              <Heart size={28} />
            </div>
            <div>
              <span>Il brand</span>
              <h2>SIAMO PUORCIPIAZZATI</h2>
              <p>
                <strong>PUORCIPIAZZATI</strong> — scritto tutto attaccato — è un progetto indipendente nato per chi vive il calcio oltre i
                novanta minuti. Incrociamo informazioni, numeri e sensibilità
                fantacalcistica per offrire contenuti veloci da leggere e utili
                davvero, senza trasformarci nell’ennesimo giornale online.
              </p>
            </div>
          </article>
          <article className="future-league-card">
            <div className="future-league-icon" aria-hidden="true">
              <Sparkles size={28} />
            </div>
            <div>
              <span>La direzione</span>
              <h2>INFORMAZIONI, STRUMENTI, COMMUNITY</h2>
              <p>
                Stiamo costruendo un luogo in cui seguire il calcio, preparare
                la formazione, leggere il mercato, confrontare le fonti e usare
                strumenti utili. Un’identità italiana, mobile-first e
                pensata per diventare ogni giorno più utile.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="portal-section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

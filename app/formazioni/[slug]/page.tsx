import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { MatchLineups } from "@/components/formations/match-lineups";
import {
  probableMatches,
} from "@/lib/probable-lineups";
import { getManagedProbableMatch } from "@/lib/lineup-content";
import { PUBLIC_SITE_URL } from "@/lib/site-url";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return probableMatches.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await getManagedProbableMatch(slug);

  if (!match) return {};

  return {
    title: `Probabili formazioni ${match.home.team} - ${match.away.team}`,
    description: `Probabili formazioni, panchine e indisponibili di ${match.home.team} - ${match.away.team}.`,
    alternates: { canonical: `/formazioni/${slug}` },
  };
}

export default async function ProbableLineupsPage({ params }: PageProps) {
  const { slug } = await params;
  const match = await getManagedProbableMatch(slug);

  if (!match) notFound();

  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.home.team} - ${match.away.team}`,
    sport: "Calcio",
    location: { "@type": "Place", name: match.stadium },
    url: `${PUBLIC_SITE_URL}/formazioni/${match.slug}`,
    homeTeam: { "@type": "SportsTeam", name: match.home.team },
    awayTeam: { "@type": "SportsTeam", name: match.away.team },
  };

  return (
    <div className="lineups-page">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
      <section className="lineups-hero">
        <div className="container">
          <Link className="lineups-back" href="/#probabili-formazioni">
            <ArrowLeft size={16} /> Tutte le partite
          </Link>
          <div className="lineups-hero-grid">
            <div>
              <span className="lineups-eyebrow">2ª giornata · Serie A</span>
              <h1>{match.home.team} <em>vs</em> {match.away.team}</h1>
            </div>
            <div className="lineups-match-meta">
              <span><CalendarDays size={17} /> {match.dateLabel}</span>
              <span><Clock3 size={17} /> {match.timeLabel}</span>
              <span>{match.stadium}</span>
            </div>
          </div>
          <div className="lineups-live-note">
            <span className="match-status-dot" /> Aggiornato il {match.updatedAt}
          </div>
        </div>
      </section>

      <section className="lineups-content">
        <div className="container">
          <div className="lineups-disclaimer">
            Le formazioni sono <strong>probabili, non ufficiali</strong>. Le percentuali sono stime editoriali PUORCIPIAZZATI e possono cambiare fino al calcio d&apos;inizio.
          </div>

          <p className="lineups-match-note">{match.note}</p>

          <MatchLineups match={match} />

          <div className="lineups-source-box">
            <div>
              <span>Metodo editoriale</span>
              <strong>Dati verificati e aggiornati dalla redazione PUORCIPIAZZATI</strong>
            </div>
            <small>Nessuna formazione è ufficiale prima della distinta di gara. Fonte di confronto: Gazzetta; calendario: Lega Serie A.</small>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, ExternalLink } from "lucide-react";

export function MatchCard({
  awayTeam,
  dateLabel,
  homeTeam,
  slug,
  sourceLabel,
  sourceUrl,
  timeLabel,
}: {
  awayTeam: string;
  dateLabel: string;
  homeTeam: string;
  slug: string;
  sourceLabel: string;
  sourceUrl: string;
  timeLabel: string;
}) {
  return (
    <article className="match-card">
      <div className="match-card-topline">
        <span>2ª giornata · Serie A</span>
        <span className="match-status-dot" />
      </div>
      <div className="match-teams">
        <TeamBadge name={homeTeam} />
        <div className="match-versus">VS</div>
        <TeamBadge name={awayTeam} />
      </div>
      <div className="match-schedule">
        <span><CalendarDays size={15} /> {dateLabel}</span>
        <span><Clock3 size={15} /> {timeLabel}</span>
      </div>
      <Link
        className="match-card-link"
        href={`/formazioni/${slug}`}
      >
        Vedi probabili formazioni <ArrowRight size={17} />
      </Link>
      <a
        className="match-card-source"
        href={sourceUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Calendario: {sourceLabel} <ExternalLink size={12} />
      </a>
    </article>
  );
}
function TeamBadge({ name }: { name: string }) {
  const teamLogos: Record<string, string> = {
    Milan: "/AC_Milan.png",
    Atalanta: "/atalanta.svg",
    Bologna: "/bologna.webp",
    Como: "/como.png",
    Fiorentina: "/fiorentina.webp",
    Frosinone: "/frosinone.webp",
    Genoa: "/genoa.jpg",
    Inter: "/inter.png",
    Juventus: "/juventus.png",
    Lazio: "/lazio.png",
    Lecce: "/lecce.jpg",
    Monza: "/monza.png",
    Napoli: "/napoli.png",
    Parma: "/parma.png",
    Roma: "/roma.png",
    Sassuolo: "/sassuolo.svg",
    Torino: "/torino.webp",
    Udinese: "/udinese.svg",
    Venezia: "/venezia.webp",
    Verona: "/verona.png",
  };

  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logo = teamLogos[name];

  return (
    <div className="match-team">
      <div className="team-crest-placeholder">
        {logo ? (
          <img
            src={logo}
            alt={`Stemma ${name}`}
            style={{
              width: "82%",
              height: "82%",
              objectFit: "contain",
            }}
          />
        ) : (
          initials
        )}
      </div>
      <strong>{name}</strong>
    </div>
  );
}


  return (
    <div className="match-team">
      <div className="team-crest-placeholder">{initials}</div>
      <strong>{name}</strong>
    </div>
  );
}

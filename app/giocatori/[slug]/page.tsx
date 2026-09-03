import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDot, CornerUpRight, Hash, Newspaper, ShieldCheck, Shirt, Sparkles } from "lucide-react";
import { editorialNews } from "@/lib/editorial-data";
import { getPublishedArticles } from "@/lib/editorial-content";
import { getProbablePlayers } from "@/lib/probable-lineups";
import { getManagedProbablePlayer } from "@/lib/lineup-content";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProbablePlayers().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const player = await getManagedProbablePlayer((await params).slug);
  if (!player) return {};
  return {
    title: `${player.name}: scheda, consigli e news`,
    description: `Scheda fantacalcio di ${player.name}: squadra, ruolo, probabilità di impiego, consigli e ultime news PUORCIPIAZZATI.`,
    alternates: { canonical: `/giocatori/${player.slug}` },
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const player = await getManagedProbablePlayer((await params).slug);
  if (!player) notFound();

  const managedNews = await getPublishedArticles();
  const allNews = Array.from(
    new Map([...managedNews, ...editorialNews].map((article) => [article.slug, article])).values(),
  );
  const relatedNews = allNews.filter((article) => articleMatchesPlayer(article, player.name));
  const profileStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    image: player.photoUrl,
    jobTitle: "Calciatore",
    memberOf: { "@type": "SportsTeam", name: player.team },
    url: `https://puorcipiazzati.it/giocatori/${player.slug}`,
  };

  return (
    <main className="player-page">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(profileStructuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
      <div className="container player-shell">
        <Link className="lineups-back" href="/#probabili-formazioni">
          <ArrowLeft size={16} /> Probabili formazioni
        </Link>

        <section className="player-hero-card">
          <div className="player-profile-avatar">
            {player.photoUrl ? (
              <Image alt={`Foto di ${player.name}`} fill priority sizes="160px" src={player.photoUrl} unoptimized />
            ) : (
              <span className="player-jersey-placeholder"><b>{player.shirtNumber ?? initials(player.name)}</b><small>{player.team}</small></span>
            )}
          </div>
          <div className="player-profile-copy">
            <span>SCHEDA GIOCATORE</span>
            <h1>{player.name}</h1>
            <p>{player.team}</p>
            <div className="player-facts">
              <div><Shirt /><small>Ruolo</small><strong>{player.role ?? "In aggiornamento"}</strong></div>
              <div><Hash /><small>Maglia</small><strong>{player.shirtNumber ? `#${player.shirtNumber}` : "In aggiornamento"}</strong></div>
              <div><ShieldCheck /><small>Stato</small><strong>{player.status === "starter" ? `Titolare stimato · ${player.probability}%` : "Panchina prevista"}</strong></div>
            </div>
            <Link className="player-next-match" href={`/formazioni/${player.matchSlug}`}><CalendarDays /> Prossima partita: {player.matchLabel} <ArrowRight /></Link>
          </div>
        </section>

        <div className="player-content-grid">
          <section className="player-analysis-card player-season-dashboard">
            <div className="player-stats-heading"><div><span>NUMERI STAGIONALI</span><h2>Rendimento {player.stats ? `${player.stats.season}/${player.stats.season + 1}` : "in aggiornamento"}</h2></div><Sparkles /></div>
            <div className="player-stat-grid">
              <StatTile accent="white" label="Partite con voto" value={player.stats ? `${player.stats.ratedAppearances ?? 0}/${player.stats.appearances ?? 0}` : undefined} />
              <StatTile accent="green" label="Partite da titolare" value={player.stats?.starts} />
              <StatTile accent="yellow" label="Partite da subentrato" value={player.stats?.substituteAppearances} />
              <StatTile accent="red" label="Gol" value={player.stats?.goals} />
              <StatTile accent="white" label="Assist" value={player.stats?.assists} />
              <StatTile accent="red" icon={<CircleDot />} label="Rigori segnati" value={player.stats?.penalties} />
              <StatTile accent="yellow" label="Cartellini gialli" value={player.stats?.yellowCards} />
              <StatTile accent="red" label="Cartellini rossi" value={player.stats?.redCards} />
            </div>
            <div className="player-stats-status"><ShieldCheck />{player.stats ? `Dati aggiornati il ${formatStatsDate(player.stats.updatedAt)} tramite ${player.stats.source ?? "fonte statistica verificata"}.` : "Statistiche non ancora importate: la redazione deve avviare l’aggiornamento dal pannello admin."}</div>
          </section>

          <section className="player-news-card">
            <div className="player-section-title"><Newspaper /><div><span>AGGIORNAMENTI</span><h2>News su {player.name}</h2></div></div>
            {relatedNews.length ? (
              <div className="player-related-news">
                {relatedNews.map((article) => (
                  <Link href={`/news/${article.slug}`} key={article.slug}>
                    <small>{article.category}</small>
                    <strong>{article.title}</strong>
                    <span>Leggi l’analisi <ArrowRight /></span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="player-empty-news">Nessuna notizia verificata pubblicata al momento. La scheda verrà aggiornata quando avremo informazioni utili, non semplici voci.</p>
            )}
          </section>
        </div>
        <div className="player-source-note">Fonti: statistiche fantacalcistiche tramite <a href="https://www.fantacalcio.it/statistiche-serie-a" rel="noreferrer" target="_blank">Fantacalcio.it</a>; fotografie e rose tramite API-Football; proiezione della formazione confrontata dalla redazione. Le statistiche non disponibili non vengono stimate.</div>
      </div>
    </main>
  );
}

function articleText(article: (typeof editorialNews)[number]) {
  return [article.title, article.summary, ...article.sections.map((section) => section.body)]
    .join(" ")
    .toLowerCase();
}

function articleMatchesPlayer(article: (typeof editorialNews)[number], name: string) {
  const text = normalizeText(articleText(article));
  const normalizedName = normalizeText(name.replace(/^\w\.\s*/, ""));
  const surname = normalizedName.split(" ").at(-1) ?? normalizedName;
  if (normalizedName.length >= 4 && text.includes(normalizedName)) return true;
  return surname.length >= 4 && new RegExp(`(^|\\s)${escapeRegExp(surname)}(?=\\s|$)`).test(text);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function StatTile({ accent, icon, label, value }: { accent: "green" | "yellow" | "red" | "white"; icon?: React.ReactNode; label: string; value?: number | string }) {
  return <div className={`player-stat-tile is-${accent}`}><span>{icon ?? <CornerUpRight />}</span><strong>{value ?? "—"}</strong><small>{label}</small></div>;
}

function formatStatsDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "data non disponibile" : new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Rome" }).format(date);
}

function initials(name: string) {
  return name.replace(/\./g, "").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getPublishedArticles } from "@/lib/editorial-content";
import { editorialNews } from "@/lib/editorial-data";
import { getManagedProbablePlayers } from "@/lib/lineup-content";

export const metadata: Metadata = { title: "Cerca", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? "";
  const normalized = normalize(query);
  const [players, managedNews] = await Promise.all([getManagedProbablePlayers(), getPublishedArticles()]);
  const news = managedNews.length ? managedNews : editorialNews;
  const playerResults = normalized ? players.filter((player) => normalize(`${player.name} ${player.team} ${player.role ?? ""}`).includes(normalized)).slice(0, 24) : [];
  const newsResults = normalized ? news.filter((article) => normalize(`${article.title} ${article.summary} ${article.category}`).includes(normalized)).slice(0, 12) : [];

  return (
    <div className="search-page">
      <div className="container search-shell">
        <div className="search-heading"><Search /><div><span>RICERCA PUORCIPIAZZATI</span><h1>{query ? `Risultati per “${query}”` : "Cerca nel portale"}</h1><p>Giocatori, squadre, probabili formazioni e analisi in un solo posto.</p></div></div>
        {!query ? <p className="search-empty">Scrivi un nome nella barra di ricerca in alto.</p> : null}
        {query && !playerResults.length && !newsResults.length ? <p className="search-empty">Nessun risultato trovato. Prova con il cognome del calciatore o il nome della squadra.</p> : null}
        {playerResults.length ? <section className="search-results"><header><span>Calciatori</span><strong>{playerResults.length} risultati</strong></header><div className="search-player-grid">{playerResults.map((player) => <Link href={`/giocatori/${player.slug}`} key={player.slug}>{player.photoUrl ? <span><Image alt="" fill sizes="52px" src={player.photoUrl} unoptimized /></span> : <span>{initials(player.name)}</span>}<div><strong>{player.name}</strong><small>{player.team} · {player.role}</small></div><ArrowRight /></Link>)}</div></section> : null}
        {newsResults.length ? <section className="search-results"><header><span>News e analisi</span><strong>{newsResults.length} risultati</strong></header><div className="search-news-list">{newsResults.map((article) => <Link href={`/news/${article.slug}`} key={article.slug}><small>{article.category}</small><strong>{article.title}</strong><ArrowRight /></Link>)}</div></section> : null}
      </div>
    </div>
  );
}

function normalize(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function initials(value: string) { return value.replace(/\./g, "").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

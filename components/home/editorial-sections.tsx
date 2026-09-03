"use client";

import { ArrowDownCircle, ArrowRight, Flame, Gem, ShieldAlert, Star, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditorialNews } from "@/lib/editorial-data";
import type { PublishedAdvice } from "@/lib/editorial-content";

const adviceCategories = [
  { icon: Star, label: "Da schierare", tone: "red" },
  { icon: ShieldAlert, label: "Da evitare", tone: "dark" },
  { icon: Gem, label: "Scommesse", tone: "white" },
  { icon: Flame, label: "Top player", tone: "red" },
  { icon: ArrowDownCircle, label: "Flop possibili", tone: "dark" },
];

export function DailyAdviceGrid({ items }: { items: PublishedAdvice[] }) {
  const availableDays = Array.from(new Set(items.map((item) => item.matchday))).sort((a, b) => a - b);
  const days = availableDays.length ? availableDays : [1, 2, 3];
  const [matchday, setMatchday] = useState(days[0]);

  return (
    <div>
      <div className="advice-matchday-switch" aria-label="Seleziona la giornata">
        {days.map((day) => (
          <button
            aria-pressed={day === matchday}
            className={day === matchday ? "is-active" : ""}
            key={day}
            onClick={() => setMatchday(day)}
            type="button"
          >
            {day}ª giornata
          </button>
        ))}
      </div>
      <div className="advice-card-grid">
        {adviceCategories.map(({ icon: Icon, label, tone }, index) => {
          const category = ["start", "avoid", "differential", "top", "flop"][index];
          const item = items.find((entry) => entry.matchday === matchday && entry.category === category);
          return (
            <article className={`advice-card advice-card-${tone}`} key={label}>
              {item?.imageUrl ? <Image alt={item.subject} className="advice-card-image" height={120} src={item.imageUrl} unoptimized width={220} /> : <Icon size={25} />}
              <span>{label} · {matchday}ª giornata</span>
              <strong>{item?.subject ?? "Contenuti in aggiornamento"}</strong>
              <small>{item ? `${item.matchLabel ? `${item.matchLabel} · ` : ""}${item.reason}` : "La redazione non ha ancora pubblicato questo consiglio"}</small>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function LatestNews({ items }: { items: EditorialNews[] }) {
  return (
    <div className="portal-news-grid">
      {items.map((item) => (
        <article className="portal-news-card" key={item.title}>
          {item.imageUrl ? <Image alt={item.title} className="news-card-image" height={190} src={item.imageUrl} unoptimized width={480} /> : null}
          <div className="news-card-icon"><Newspaper size={22} /></div>
          <div className="news-card-meta">
            <span>{item.category}</span>
            <small>{item.publishedLabel}</small>
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <Link className="news-card-internal-link" href={`/news/${item.slug}`}>
            Leggi l’analisi PUORCIPIAZZATI <ArrowRight size={15} />
          </Link>
        </article>
      ))}
    </div>
  );
}

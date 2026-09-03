"use client";

import { useState } from "react";
import { Activity, ShieldAlert } from "lucide-react";
import { FootballPitch } from "@/components/formations/football-pitch";
import type { ProbableMatch } from "@/lib/probable-lineups";

export function MatchLineups({ match }: { match: ProbableMatch }) {
  const [selected, setSelected] = useState<"home" | "away">("home");
  const lineup = match[selected];
  const unavailable = match.unavailable[selected];
  const uncertain = lineup.players.filter((player) => player.probability < 75);

  return (
    <div className="match-lineups-experience">
      <div className="lineup-team-tabs" role="tablist" aria-label="Scegli la squadra">
        {(["home", "away"] as const).map((side) => (
          <button aria-selected={selected === side} className={selected === side ? "is-active" : ""} key={side} onClick={() => setSelected(side)} role="tab" type="button">
            <span>{match[side].team.slice(0, 2).toUpperCase()}</span>
            <strong>{match[side].team}</strong>
            <small>{match[side].formation}</small>
          </button>
        ))}
      </div>

      <div className="lineup-selected-panel" role="tabpanel">
        <FootballPitch lineup={lineup} />
        <div className="selected-team-insights">
          <section className="lineups-info-card">
            <div className="lineups-info-icon"><Activity size={21} /></div>
            <div>
              <span>Titolarità da monitorare</span><h3>{lineup.team}</h3>
              {uncertain.length ? <ul>{uncertain.map((player) => <li key={player.name}>{player.name} — {player.probability}%</li>)}</ul> : <p>Nessun ballottaggio evidenziato al momento.</p>}
            </div>
          </section>
          <section className="lineups-info-card">
            <div className="lineups-info-icon"><ShieldAlert size={21} /></div>
            <div>
              <span>Infortuni, squalifiche e dubbi</span><h3>{lineup.team}</h3>
              {unavailable.length ? <div className="injury-list">{unavailable.map((item) => <InjuryItem item={item} key={item} />)}</div> : <p>Nessuna segnalazione verificata al momento.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InjuryItem({ item }: { item: string }) {
  const [name, status, detail, returnDate] = item.split(" — ").map((part) => part?.trim());
  return (
    <article>
      <strong>{name}</strong><span>{status || "Situazione da valutare"}</span>
      {detail ? <p>{detail}</p> : null}
      <small>Rientro previsto: {returnDate || "non comunicato dalla fonte"}</small>
      {!detail ? <small>Diagnosi non ancora verificata.</small> : null}
    </article>
  );
}

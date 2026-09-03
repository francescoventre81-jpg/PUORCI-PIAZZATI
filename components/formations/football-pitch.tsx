import Image from "next/image";
import Link from "next/link";
import { Activity, Radio, Users } from "lucide-react";
import { getPlayerSlug, type ProbablePlayer, type TeamProbableLineup } from "@/lib/probable-lineups";

export function FootballPitch({ lineup }: { lineup: TeamProbableLineup }) {
  const rows = getPitchRows(lineup);

  return (
    <article className="lineup-card lineup-stadium-card">
      <header className="lineup-card-header">
        <div className="lineup-team-mark" aria-hidden="true">{getInitials(lineup.team)}</div>
        <div><span><Radio /> PROIEZIONE LIVE</span><h2>{lineup.team}</h2><small>Undici probabile · aggiornato dalla redazione</small></div>
        <strong>{lineup.formation}</strong>
      </header>

      <div className="football-pitch" aria-label={`Probabile formazione ${lineup.team}, modulo ${lineup.formation}`}>
        <div className="pitch-team-watermark" aria-hidden="true">{getInitials(lineup.team)}</div>
        <div className="pitch-markings" aria-hidden="true">
          <span className="pitch-halfway" /><span className="pitch-circle" />
          <span className="pitch-box pitch-box-top" /><span className="pitch-box pitch-box-bottom" />
        </div>
        <div className="pitch-lineup">
          {rows.map((row, rowIndex) => (
            <div className="pitch-row" key={`${lineup.team}-row-${rowIndex}`}>
              {row.map((player) => <PitchPlayer key={player.name} player={player} team={lineup.team} />)}
            </div>
          ))}
        </div>
      </div>

      <section className="lineup-bench">
        <div className="lineup-board-title"><div><Users size={16} /> Panchina</div><small>Calciatori a disposizione</small></div>
        {lineup.bench.length ? (
          <div className="lineup-bench-list">
            {lineup.bench.map((player) => <BenchPlayer key={player.name} player={player} team={lineup.team} />)}
          </div>
        ) : <p className="lineup-empty">Elenco dei convocati in aggiornamento.</p>}
      </section>
    </article>
  );
}

function PitchPlayer({ player, team }: { player: ProbablePlayer; team: string }) {
  return (
    <Link className="pitch-player" href={`/giocatori/${getPlayerSlug(team, player.name)}`}>
      <PlayerAvatar player={player} />
      <span className="pitch-player-name"><b>{player.shirtNumber ?? "—"}</b><strong>{player.name}</strong></span>
      <small><Activity /> {player.probability}%</small>
    </Link>
  );
}

function BenchPlayer({ player, team }: { player: ProbablePlayer; team: string }) {
  return (
    <Link className="lineup-player-card is-compact" href={`/giocatori/${getPlayerSlug(team, player.name)}`}>
      <PlayerAvatar player={player} />
      <div className="lineup-player-copy"><strong>{player.name}</strong><small>{player.role ?? "Ruolo in aggiornamento"}</small></div>
      <span className="lineup-probability">Scheda <span aria-hidden="true">→</span></span>
    </Link>
  );
}

function PlayerAvatar({ player }: { player: ProbablePlayer }) {
  return (
    <span className="lineup-player-avatar">
      {player.photoUrl ? <Image alt={`Foto di ${player.name}`} fill sizes="72px" src={player.photoUrl} unoptimized /> : <span className="lineup-jersey-number">{player.shirtNumber ?? getPlayerInitials(player.name)}</span>}
      {player.shirtNumber && player.photoUrl ? <b>{player.shirtNumber}</b> : null}
    </span>
  );
}

function getPitchRows(lineup: TeamProbableLineup) {
  const players = lineup.players.slice(0, 11);
  const goalkeeper = players.slice(0, 1);
  const lineSizes = lineup.formation.split("-").map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (lineSizes.reduce((total, value) => total + value, 0) !== players.length - 1) {
    return [players.slice(8), players.slice(4, 8), players.slice(1, 4), goalkeeper].filter((row) => row.length);
  }
  let cursor = 1;
  const formationRows = lineSizes.map((size) => { const row = players.slice(cursor, cursor + size); cursor += size; return row; });
  return [...formationRows.reverse(), goalkeeper];
}

function getPlayerInitials(name: string) { return name.replace(/\./g, "").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(); }
function getInitials(team: string) { return team.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(); }

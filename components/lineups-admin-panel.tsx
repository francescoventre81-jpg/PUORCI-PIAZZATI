"use client";

import { BarChart3, Camera, ChevronDown, DownloadCloud, Plus, Save, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { LineupsImportState } from "@/lib/background-lineup-import";
import type { ProbableMatch, ProbablePlayer, TeamProbableLineup } from "@/lib/probable-lineups";
import { createClient } from "@/lib/supabase/client";

const roles: NonNullable<ProbablePlayer["role"]>[] = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

export function LineupsAdminPanel({ initialMatches }: { initialMatches: ProbableMatch[] }) {
  const [matches, setMatches] = useState(() => structuredClone(initialMatches));
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importState, setImportState] = useState<LineupsImportState | null>(null);
  const [message, setMessage] = useState("");
  const teams = useMemo(
    () => matches.flatMap((match, matchIndex) => [
      { match, matchIndex, side: "home" as const },
      { match, matchIndex, side: "away" as const },
    ]),
    [matches],
  );

  useEffect(() => {
    let active = true;
    async function loadStatus() {
      try {
        const response = await fetch("/api/admin/lineups/import", { cache: "no-store" });
        const result = (await response.json()) as { state?: LineupsImportState | null };
        if (active && response.ok) setImportState(result.state ?? null);
      } catch {
        // Il pannello resta utilizzabile anche se il controllo di stato fallisce.
      }
    }
    void loadStatus();
    const interval = window.setInterval(() => void loadStatus(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  function updateTeam(matchIndex: number, side: "home" | "away", update: (team: TeamProbableLineup) => TeamProbableLineup) {
    setMatches((current) => current.map((match, index) => index === matchIndex ? { ...match, [side]: update(match[side]) } : match));
  }

  function updateMatch(matchIndex: number, field: "note" | "stadium" | "dateLabel" | "timeLabel", value: string) {
    setMatches((current) => current.map((match, index) => index === matchIndex ? { ...match, [field]: value } : match));
  }

  async function saveAll() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/lineups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Pubblicazione non riuscita.");
      setMessage(result.message ?? "Formazioni pubblicate.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pubblicazione non riuscita.");
    } finally {
      setBusy(false);
    }
  }

  async function startImport() {
    if (!window.confirm("Avviare l'importazione automatica di tutte le rose e fotografie? Puoi chiudere questa pagina: il server continuerà da solo e salverà ogni squadra completata.")) return;
    setImporting(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/lineups/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const result = (await response.json()) as { error?: string; message?: string; state?: LineupsImportState };
      if (!response.ok) throw new Error(result.error ?? "Importazione non riuscita.");
      setImportState(result.state ?? null);
      setMessage("Importazione avviata. Puoi uscire: Cloudflare continuerà automaticamente e salverà ogni squadra completata.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Importazione non riuscita.");
    } finally {
      setImporting(false);
    }
  }

  async function updateStatistics(teamName: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/lineups/statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName }),
      });
      const result = (await response.json()) as { error?: string; message?: string; matches?: ProbableMatch[] };
      if (!response.ok) throw new Error(result.error ?? "Aggiornamento statistiche non riuscito.");
      if (result.matches) setMatches(result.matches);
      setMessage(result.message ?? "Statistiche aggiornate.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Aggiornamento statistiche non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section lineups-admin" id="formazioni">
      <header className="lineups-admin-heading">
        <div><span>FORMAZIONI LIVE</span><h2>Squadre e calciatori</h2><p>Modifica rose, titolari, panchina, percentuali e fotografie. Un solo salvataggio aggiorna il sito pubblico.</p></div>
        <div className="lineups-admin-heading-actions">
          <button className="secondary" disabled={busy || importing || importState?.status === "running"} onClick={() => void startImport()} type="button"><DownloadCloud /> {importing ? "Avvio…" : importState?.status === "running" ? `Importazione ${importState.processedTeams.length}/${importState.totalTeams}` : "Avvia importazione automatica"}</button>
          <button disabled={busy} onClick={() => void saveAll()} type="button"><Save /> {busy ? "Salvataggio…" : "Pubblica tutte"}</button>
        </div>
      </header>
      {message ? <p className="admin-message">{message}</p> : null}
      {importState ? <ImportProgress state={importState} /> : null}

      <div className="lineups-admin-summary"><Users /> {teams.length} squadre · {teams.reduce((total, item) => total + item.match[item.side].players.length + item.match[item.side].bench.length, 0)} calciatori gestibili</div>

      <div className="lineups-admin-list">
        {teams.map(({ match, matchIndex, side }) => {
          const team = match[side];
          return (
            <details className="lineups-admin-team" key={`${match.slug}-${side}`}>
              <summary><span className="lineups-admin-badge">{initials(team.team)}</span><strong>{team.team}</strong><small>{match.home.team} – {match.away.team}</small><b>{team.formation}</b><ChevronDown /></summary>
              <div className="lineups-admin-team-body">
                <div className="lineups-admin-match-fields">
                  <label>Modulo<input value={team.formation} onChange={(event) => updateTeam(matchIndex, side, (row) => ({ ...row, formation: event.target.value }))} /></label>
                  <label>Data<input value={match.dateLabel} onChange={(event) => updateMatch(matchIndex, "dateLabel", event.target.value)} /></label>
                  <label>Ora<input value={match.timeLabel} onChange={(event) => updateMatch(matchIndex, "timeLabel", event.target.value)} /></label>
                  <label>Stadio<input value={match.stadium} onChange={(event) => updateMatch(matchIndex, "stadium", event.target.value)} /></label>
                </div>
                <label className="lineups-admin-note">Nota partita<textarea rows={2} value={match.note} onChange={(event) => updateMatch(matchIndex, "note", event.target.value)} /></label>
                <button className="team-stats-update" disabled={busy} onClick={() => void updateStatistics(team.team)} type="button"><BarChart3 /> Aggiorna statistiche di {team.team}</button>
                <RosterEditor
                  lineup={team}
                  onChange={(next) => updateTeam(matchIndex, side, () => next)}
                />
                <label className="lineups-admin-note">Assenti e dubbi<textarea rows={3} value={match.unavailable[side].join("\n")} onChange={(event) => setMatches((current) => current.map((row, index) => index === matchIndex ? { ...row, unavailable: { ...row.unavailable, [side]: event.target.value.split("\n").filter(Boolean) } } : row))} /></label>
              </div>
            </details>
          );
        })}
      </div>
      <div className="lineups-admin-sticky"><button disabled={busy} onClick={() => void saveAll()} type="button"><Save /> {busy ? "Salvataggio…" : "Pubblica aggiornamenti"}</button></div>
    </section>
  );
}

function ImportProgress({ state }: { state: LineupsImportState }) {
  const nextTeam = state.resolvedTeams?.[state.nextTeamIndex]?.siteName;
  if (state.status === "running") {
    return <div className="admin-message">
      <strong>Importazione automatica attiva: {state.processedTeams.length} di {state.totalTeams} squadre completate.</strong>
      {nextTeam ? ` Prossima squadra: ${nextTeam}.` : " Preparazione elenco squadre in corso."}
      {state.failedTeams.length ? ` Non completate dopo tre tentativi: ${state.failedTeams.join(", ")}.` : ""}
      {state.lastError ? ` Ultimo avviso: ${state.lastError}` : ""}
      {" "}Puoi chiudere la pagina: il lavoro continua sul server.
    </div>;
  }
  if (state.status === "completed") {
    return <div className="admin-message"><strong>Importazione terminata: {state.processedTeams.length} squadre completate.</strong>{state.failedTeams.length ? ` Da controllare manualmente: ${state.failedTeams.join(", ")}.` : " Tutte le rose disponibili sono state salvate."} Ricarica la pagina per vedere i dati aggiornati.</div>;
  }
  return null;
}

function RosterEditor({ lineup, onChange }: { lineup: TeamProbableLineup; onChange: (lineup: TeamProbableLineup) => void }) {
  function update(status: "starter" | "bench", index: number, patch: Partial<ProbablePlayer>) {
    const key = status === "starter" ? "players" : "bench";
    onChange({ ...lineup, [key]: lineup[key].map((player, playerIndex) => playerIndex === index ? { ...player, ...patch } : player) });
  }
  function move(status: "starter" | "bench", index: number) {
    const from = status === "starter" ? "players" : "bench";
    const to = status === "starter" ? "bench" : "players";
    const player = { ...lineup[from][index], status: status === "starter" ? "bench" as const : "starter" as const };
    onChange({ ...lineup, [from]: lineup[from].filter((_, i) => i !== index), [to]: [...lineup[to], player] });
  }
  function remove(status: "starter" | "bench", index: number) {
    const key = status === "starter" ? "players" : "bench";
    if (!window.confirm("Eliminare questo calciatore dalla rosa visualizzata?")) return;
    onChange({ ...lineup, [key]: lineup[key].filter((_, i) => i !== index) });
  }
  function add(status: "starter" | "bench") {
    const key = status === "starter" ? "players" : "bench";
    onChange({ ...lineup, [key]: [...lineup[key], { name: "Nuovo calciatore", probability: status === "starter" ? 70 : 25, role: "Centrocampista", status }] });
  }
  return (
    <div className="roster-admin-columns">
      <RosterList title="Titolari" players={lineup.players} status="starter" onAdd={() => add("starter")} onMove={move} onRemove={remove} onUpdate={update} />
      <RosterList title="Panchina" players={lineup.bench} status="bench" onAdd={() => add("bench")} onMove={move} onRemove={remove} onUpdate={update} />
    </div>
  );
}

function RosterList({ title, players, status, onAdd, onMove, onRemove, onUpdate }: {
  title: string; players: ProbablePlayer[]; status: "starter" | "bench"; onAdd: () => void;
  onMove: (status: "starter" | "bench", index: number) => void; onRemove: (status: "starter" | "bench", index: number) => void;
  onUpdate: (status: "starter" | "bench", index: number, patch: Partial<ProbablePlayer>) => void;
}) {
  return <section className="roster-admin-list"><header><h3>{title} <small>{players.length}</small></h3><button onClick={onAdd} type="button"><Plus /> Aggiungi</button></header>
    {players.map((player, index) => <PlayerEditor key={`${player.name}-${index}`} player={player} status={status} onMove={() => onMove(status, index)} onRemove={() => onRemove(status, index)} onUpdate={(patch) => onUpdate(status, index, patch)} />)}
  </section>;
}

function PlayerEditor({ player, status, onMove, onRemove, onUpdate }: { player: ProbablePlayer; status: "starter" | "bench"; onMove: () => void; onRemove: () => void; onUpdate: (patch: Partial<ProbablePlayer>) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `players/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("editorial-images").upload(path, file, { contentType: file.type, upsert: false });
    if (!error) onUpdate({ photoUrl: supabase.storage.from("editorial-images").getPublicUrl(path).data.publicUrl });
    else window.alert(error.message);
    setUploading(false);
  }
  return <div className="roster-player-editor">
    <div className="roster-player-photo">{player.photoUrl ? <Image alt="" fill sizes="46px" src={player.photoUrl} unoptimized /> : <span>{player.shirtNumber ?? initials(player.name)}</span>}<label title="Carica foto"><Camera /><input accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0])} type="file" /> </label></div>
    <div className="roster-player-fields">
      <input aria-label="Nome calciatore" value={player.name} onChange={(event) => onUpdate({ name: event.target.value })} />
      <div><select aria-label="Ruolo" value={player.role ?? "Centrocampista"} onChange={(event) => onUpdate({ role: event.target.value as ProbablePlayer["role"] })}>{roles.map((role) => <option key={role}>{role}</option>)}</select><input aria-label="Numero maglia" max={99} min={1} placeholder="#" type="number" value={player.shirtNumber ?? ""} onChange={(event) => onUpdate({ shirtNumber: Number(event.target.value) || undefined })} /><input aria-label="Probabilità titolarità" max={100} min={0} type="number" value={player.probability} onChange={(event) => onUpdate({ probability: Number(event.target.value) })} /></div>
      <input aria-label="URL foto" placeholder="URL foto autorizzata" value={player.photoUrl ?? ""} onChange={(event) => onUpdate({ photoUrl: event.target.value || undefined })} />
      <div className="roster-player-stat-fields">
        {([
          ["starts", "Titolare"], ["substituteAppearances", "Subentri"], ["ratedAppearances", "Con voto"], ["appearances", "Presenze"], ["goals", "Gol"], ["assists", "Assist"],
          ["penalties", "Rigori"], ["yellowCards", "Gialli"], ["redCards", "Rossi"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input min={0} type="number" value={player.stats?.[key] ?? 0} onChange={(event) => onUpdate({ stats: { assists: 0, goals: 0, penalties: 0, redCards: 0, season: new Date().getFullYear(), starts: 0, substituteAppearances: 0, updatedAt: new Date().toISOString(), yellowCards: 0, ...player.stats, [key]: Math.max(0, Number(event.target.value) || 0) } })} /></label>)}
      </div>
    </div>
    <div className="roster-player-actions"><button disabled={uploading} onClick={onMove} type="button">{status === "starter" ? "In panchina" : "Titolare"}</button><button aria-label={`Elimina ${player.name}`} onClick={onRemove} type="button"><Trash2 /></button></div>
  </div>;
}

function initials(value: string) { return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

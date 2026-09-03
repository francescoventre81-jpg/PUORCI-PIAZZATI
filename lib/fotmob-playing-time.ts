import { samePlayerName, sameTeamName } from "./api-football";
import type { ProbableMatch, ProbablePlayer, TeamProbableLineup } from "./probable-lineups";

export const FOTMOB_SERIE_A_URL = "https://www.fotmob.com/leagues/55/overview/serie-a";
const FOTMOB_LEAGUE_API = "https://www.fotmob.com/api/data/leagues?id=55&ccode3=ITA&season=2026%2F2027";
const FOTMOB_MATCH_API = "https://www.fotmob.com/api/data/matchDetails?matchId=";

type Fixture = { id: string; home: { name: string }; away: { name: string }; status: { finished?: boolean } };
type LineupPlayer = { id?: number; name: string; performance?: { substitutionEvents?: Array<{ type?: string }> } };
type MatchLineup = { name: string; starters?: LineupPlayer[]; subs?: LineupPlayer[] };
type PlayingTimeRow = { appearances: number; name: string; starts: number; substituteAppearances: number; team: string };

export async function fetchSerieAPlayingTime(onlyTeam?: string) {
  const league = await getJson<{ fixtures?: { allMatches?: Fixture[] } }>(FOTMOB_LEAGUE_API);
  const fixtures = (league.fixtures?.allMatches ?? []).filter((fixture) =>
    fixture.status.finished && (!onlyTeam || sameTeamName(fixture.home.name, onlyTeam) || sameTeamName(fixture.away.name, onlyTeam)),
  );
  if (!fixtures.length) throw new Error("Nessun tabellino concluso disponibile per la Serie A 2026/27.");

  const details: Array<{ content?: { lineup?: { homeTeam?: MatchLineup; awayTeam?: MatchLineup } } }> = [];
  for (let index = 0; index < fixtures.length; index += 5) {
    details.push(...await Promise.all(fixtures.slice(index, index + 5).map((fixture) => getJson(`${FOTMOB_MATCH_API}${encodeURIComponent(fixture.id)}`))));
  }

  const totals = new Map<string, PlayingTimeRow>();
  for (const detail of details) {
    for (const lineup of [detail.content?.lineup?.homeTeam, detail.content?.lineup?.awayTeam]) {
      if (!lineup?.name) continue;
      for (const player of lineup.starters ?? []) add(lineup.name, player.name, true);
      for (const player of lineup.subs ?? []) {
        const entered = player.performance?.substitutionEvents?.some((event) => event.type === "subIn");
        if (entered) add(lineup.name, player.name, false);
      }
    }
  }
  return Array.from(totals.values());

  function add(team: string, name: string, starter: boolean) {
    const key = `${normalize(team)}:${normalize(name)}`;
    const current = totals.get(key) ?? { appearances: 0, name, starts: 0, substituteAppearances: 0, team };
    current.appearances += 1;
    if (starter) current.starts += 1;
    else current.substituteAppearances += 1;
    totals.set(key, current);
  }
}

export function applySerieAPlayingTime(matches: ProbableMatch[], rows: PlayingTimeRow[], onlyTeam?: string) {
  let updatedPlayers = 0;
  const next = matches.map((match) => ({ ...match, home: updateTeam(match.home), away: updateTeam(match.away) }));
  return { matches: next, updatedPlayers };

  function updateTeam(team: TeamProbableLineup) {
    if (onlyTeam && !sameTeamName(team.team, onlyTeam)) return team;
    const candidates = rows.filter((row) => sameTeamName(row.team, team.team));
    const updatePlayer = (player: ProbablePlayer) => {
      const row = candidates.find((candidate) => samePlayerName(candidate.name, player.name)) ?? fuzzyMatch(player.name, candidates);
      const base = player.stats ?? { assists: 0, goals: 0, penalties: 0, redCards: 0, season: 2026, updatedAt: new Date().toISOString(), yellowCards: 0 };
      if (!row) return { ...player, stats: { ...base, appearances: 0, starts: 0, substituteAppearances: 0 } };
      updatedPlayers += 1;
      return { ...player, stats: { ...base, appearances: row.appearances, source: "Fantacalcio.it + tabellini FotMob", starts: row.starts, substituteAppearances: row.substituteAppearances, updatedAt: new Date().toISOString() } };
    };
    return { ...team, players: team.players.map(updatePlayer), bench: team.bench.map(updatePlayer) };
  }
}

function fuzzyMatch(name: string, rows: PlayingTimeRow[]) {
  const surname = normalize(name).split(" ").at(-1);
  if (!surname) return undefined;
  const matches = rows.filter((row) => normalize(row.name).split(" ").includes(surname));
  return matches.length === 1 ? matches[0] : undefined;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store", headers: { "User-Agent": "PUORCIPIAZZATI/1.0 (+https://puorcipiazzati.it)" }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Tabellini non disponibili (HTTP ${response.status}).`);
  return await response.json() as T;
}

function normalize(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }

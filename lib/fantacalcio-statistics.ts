import { samePlayerName } from "./api-football";
import type { PlayerSeasonStats, ProbableMatch, ProbablePlayer, TeamProbableLineup } from "./probable-lineups";

export const FANTACALCIO_STATS_URL = "https://www.fantacalcio.it/statistiche-serie-a";
const CURRENT_SEASON = 2026;

type FantasyStatRow = {
  appearances: number;
  assists: number;
  goals: number;
  name: string;
  penalties: number;
  redCards: number;
  teamCode: string;
  yellowCards: number;
};

const TEAM_CODES: Record<string, string> = {
  Atalanta: "ATA", Bologna: "BOL", Cagliari: "CAG", Como: "COM",
  Fiorentina: "FIO", Frosinone: "FRO", Genoa: "GEN", Inter: "INT",
  Juventus: "JUV", Lazio: "LAZ", Lecce: "LEC", Milan: "MIL",
  Monza: "MON", Napoli: "NAP", Parma: "PAR", Roma: "ROM",
  Sassuolo: "SAS", Torino: "TOR", Udinese: "UDI", Venezia: "VEN",
};

export async function fetchFantacalcioStatistics() {
  const response = await fetch(FANTACALCIO_STATS_URL, {
    cache: "no-store",
    headers: { "User-Agent": "PUORCIPIAZZATI/1.0 (+https://puorcipiazzati.it)" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`Fantacalcio.it non disponibile (HTTP ${response.status}).`);
  const rows = parseFantacalcioStatistics(await response.text());
  if (rows.length < 100) throw new Error("La fonte Fantacalcio non ha restituito una tabella completa.");
  return rows;
}

export function applyFantacalcioStatistics(matches: ProbableMatch[], rows: FantasyStatRow[], onlyTeam?: string) {
  let updatedPlayers = 0;
  const updatedAt = new Date().toISOString();
  const next = matches.map((match) => ({
    ...match,
    home: updateTeam(match.home),
    away: updateTeam(match.away),
  }));
  return { matches: next, updatedPlayers, updatedAt };

  function updateTeam(team: TeamProbableLineup) {
    if (onlyTeam && normalize(team.team) !== normalize(onlyTeam)) return team;
    const teamCode = TEAM_CODES[team.team];
    if (!teamCode) return team;
    const candidates = rows.filter((row) => row.teamCode === teamCode);
    const updatePlayer = (player: ProbablePlayer) => {
      const row = bestPlayerMatch(player.name, candidates);
      if (!row) return player;
      updatedPlayers += 1;
      const stats: PlayerSeasonStats = {
        ...player.stats,
        ratedAppearances: row.appearances,
        assists: row.assists,
        goals: row.goals,
        penalties: row.penalties,
        redCards: row.redCards,
        season: CURRENT_SEASON,
        source: "Fantacalcio.it",
        updatedAt,
        yellowCards: row.yellowCards,
      };
      return { ...player, stats };
    };
    return { ...team, players: team.players.map(updatePlayer), bench: team.bench.map(updatePlayer) };
  }
}

export function parseFantacalcioStatistics(html: string): FantasyStatRow[] {
  const rows: FantasyStatRow[] = [];
  for (const match of html.matchAll(/<tr class="player-row"[\s\S]*?<\/tr>/g)) {
    const row = match[0];
    const name = decodeHtml(attribute(row, "data-filter-keywords"));
    const teamCode = cell(row, "sq").toUpperCase();
    if (!name || !teamCode) continue;
    rows.push({
      appearances: integer(cell(row, "pg")),
      assists: integer(cell(row, "ass")),
      goals: integer(cell(row, "gol")),
      name,
      penalties: integer(cell(row, "rig").split("/")[0]),
      redCards: integer(cell(row, "esp")),
      teamCode,
      yellowCards: integer(cell(row, "amm")),
    });
  }
  return rows;
}

function bestPlayerMatch(name: string, rows: FantasyStatRow[]) {
  const exact = rows.find((row) => samePlayerName(row.name, name));
  if (exact) return exact;
  const wanted = tokens(name);
  return rows
    .map((row) => ({ row, score: nameScore(wanted, tokens(row.name)) }))
    .filter(({ score }) => score >= 60)
    .sort((a, b) => b.score - a.score)[0]?.row;
}

function nameScore(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0;
  if (left.join(" ") === right.join(" ")) return 100;
  const leftSurname = left.at(-1)!;
  const rightSurname = right.length > 1 && right.at(-1)!.length <= 2 ? right[0] : right.at(-1)!;
  if (leftSurname === rightSurname) return 80;
  if (left.includes(right[0]) || right.includes(leftSurname)) return 65;
  return 0;
}

function tokens(value: string) { return normalize(value).split(" ").filter(Boolean); }
function normalize(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function attribute(row: string, name: string) { return row.match(new RegExp(`${name}="([^"]*)"`))?.[1]?.trim() ?? ""; }
function cell(row: string, key: string) { return decodeHtml(row.match(new RegExp(`<td[^>]*data-col-key="${key}"[^>]*>([\\s\\S]*?)<\\/td>`))?.[1]?.replace(/<[^>]+>/g, " ").trim() ?? ""); }
function integer(value: string) { const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ""), 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; }
function decodeHtml(value: string) { return value.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").trim(); }

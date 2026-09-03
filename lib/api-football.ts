import type {
  PlayerRole,
  PlayerSeasonStats,
  ProbablePlayer,
  TeamProbableLineup,
} from "./probable-lineups";

const API_BASE_URL = "https://v3.football.api-sports.io";
const ITALY_COUNTRY = "Italy";

type ApiEnvelope<T> = {
  errors?: Record<string, string> | string[];
  paging?: { current: number; total: number };
  response?: T;
};

type ApiTeam = { team: { id: number; name: string } };
type ApiSquad = {
  team: { id: number; name: string };
  players: Array<{
    id: number;
    name: string;
    age: number | null;
    number: number | null;
    position: string;
    photo: string;
  }>;
};

type ApiPlayerStatistics = {
  player: { id: number; name: string; photo?: string };
  statistics: Array<{
    cards?: { red?: number | null; yellow?: number | null };
    games?: { appearences?: number | null; lineups?: number | null };
    goals?: { assists?: number | null; total?: number | null };
    penalty?: { scored?: number | null };
    substitutes?: { in?: number | null };
  }>;
};

type ApiInjury = {
  fixture?: { date?: string; id?: number };
  player: {
    id: number;
    name: string;
    photo?: string;
    reason?: string | null;
    type?: string | null;
  };
  team: { id: number; name: string };
};

export type ImportedInjury = {
  fixtureDate?: string;
  playerId: number;
  playerName: string;
  reason?: string;
  teamName: string;
  type?: string;
};

export type ResolvedApiTeam = { apiTeamId: number; siteName: string };
export type TeamResolutionResult = {
  resolvedTeams: ResolvedApiTeam[];
  skippedTeams: string[];
  requestsUsed: number;
};

export async function resolveItalianTeams(
  siteTeamNames: string[],
): Promise<TeamResolutionResult> {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) throw new Error("API_FOOTBALL_KEY non configurata.");

  const teamsResponse = await apiGet<ApiTeam[]>(
    `/teams?country=${encodeURIComponent(ITALY_COUNTRY)}`,
    apiKey,
  );
  const apiTeams = teamsResponse.response ?? [];
  const resolvedTeams = siteTeamNames
    .map((siteName) => ({
      siteName,
      apiTeam: findApiTeam(siteName, apiTeams),
    }))
    .filter(
      (entry): entry is { siteName: string; apiTeam: ApiTeam } =>
        Boolean(entry.apiTeam),
    )
    .map(({ siteName, apiTeam }) => ({
      siteName,
      apiTeamId: apiTeam.team.id,
    }));

  return {
    resolvedTeams,
    skippedTeams: siteTeamNames.filter(
      (team) => !resolvedTeams.some((entry) => entry.siteName === team),
    ),
    requestsUsed: 1,
  };
}

export async function importSingleSquad(
  current: TeamProbableLineup,
  apiTeamId: number,
) {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) throw new Error("API_FOOTBALL_KEY non configurata.");
  if (!Number.isInteger(apiTeamId) || apiTeamId <= 0) {
    throw new Error("Identificativo squadra non valido.");
  }
  const squadResponse = await apiGet<ApiSquad[]>(
    `/players/squads?team=${apiTeamId}`,
    apiKey,
  );
  const squad = squadResponse.response?.[0];
  if (!squad) throw new Error(`Rosa non disponibile per ${current.team}.`);
  return {
    team: mergeSquad(current, squad),
    importedPlayers: squad.players.length,
    requestsUsed: 1,
  };
}

export async function importTeamStatistics(current: TeamProbableLineup) {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) throw new Error("API_FOOTBALL_KEY non configurata.");
  const season = Number(process.env.API_FOOTBALL_STATS_SEASON ?? process.env.API_FOOTBALL_SEASON ?? "2026");
  if (!Number.isInteger(season)) throw new Error("Stagione statistiche non valida.");

  let apiTeamId = current.apiTeamId;
  if (!apiTeamId) {
    const resolution = await resolveItalianTeams([current.team]);
    apiTeamId = resolution.resolvedTeams[0]?.apiTeamId;
  }
  if (!apiTeamId) throw new Error(`Squadra ${current.team} non riconosciuta da API-Football.`);

  const result = await apiGet<ApiPlayerStatistics[]>(
    `/players?team=${apiTeamId}&league=135&season=${season}`,
    apiKey,
  );
  const imported = result.response ?? [];
  if (!imported.length) throw new Error(`Statistiche ${season}/${season + 1} non disponibili per ${current.team}.`);

  const updatePlayer = (player: ProbablePlayer) => {
    const match = imported.find((row) =>
      row.player.id === player.apiPlayerId || samePlayerName(row.player.name, player.name),
    );
    const row = match?.statistics[0];
    if (!match || !row) return player;
    const stats: PlayerSeasonStats = {
      appearances: safeCount(row.games?.appearences),
      assists: safeCount(row.goals?.assists),
      goals: safeCount(row.goals?.total),
      penalties: safeCount(row.penalty?.scored),
      redCards: safeCount(row.cards?.red),
      season,
      source: "API-Football",
      starts: safeCount(row.games?.lineups),
      substituteAppearances: safeCount(row.substitutes?.in),
      updatedAt: new Date().toISOString(),
      yellowCards: safeCount(row.cards?.yellow),
    };
    return {
      ...player,
      apiPlayerId: match.player.id,
      photoUrl: match.player.photo || player.photoUrl,
      stats,
    };
  };

  return {
    team: {
      ...current,
      apiTeamId,
      players: current.players.map(updatePlayer),
      bench: current.bench.map(updatePlayer),
    },
    updatedPlayers: imported.length,
    season,
  };
}

export async function importSerieAInjuries() {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) throw new Error("API_FOOTBALL_KEY non configurata.");
  const season = Number(process.env.API_FOOTBALL_SEASON ?? "2026");
  if (!Number.isInteger(season) || season < 2022 || season > 2100) {
    throw new Error("API_FOOTBALL_SEASON non valida.");
  }

  const injuries: ApiInjury[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await apiGet<ApiInjury[]>(
      `/injuries?league=135&season=${season}&page=${page}`,
      apiKey,
    );
    injuries.push(...(result.response ?? []));
    totalPages = Math.min(result.paging?.total ?? 1, 5);
    page += 1;
  } while (page <= totalPages);

  const deduped = new Map<string, ImportedInjury>();
  for (const injury of injuries) {
    const key = `${injury.team.id}:${injury.player.id}`;
    deduped.set(key, {
      fixtureDate: injury.fixture?.date,
      playerId: injury.player.id,
      playerName: injury.player.name,
      reason: injury.player.reason?.trim() || undefined,
      teamName: injury.team.name,
      type: injury.player.type?.trim() || undefined,
    });
  }

  return {
    injuries: Array.from(deduped.values()),
    requestsUsed: Math.max(1, page - 1),
    season,
  };
}

async function apiGet<T>(path: string, apiKey: string): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`API-Football non disponibile (HTTP ${response.status}).`);
  }
  const data = (await response.json()) as ApiEnvelope<T>;
  if (hasApiErrors(data.errors)) {
    throw new Error(`API-Football: ${formatApiErrors(data.errors)}`);
  }
  return data;
}

function mergeSquad(
  current: TeamProbableLineup,
  imported?: ApiSquad,
): TeamProbableLineup {
  if (!imported) return current;

  const existing = [...current.players, ...current.bench];
  const existingByName = new Map(
    existing.map((player) => [normalize(player.name), player]),
  );
  const importedPlayers = imported.players.map((player) => {
    const previous = findExistingPlayer(player.name, existingByName);
    return {
      apiPlayerId: player.id,
      name: player.name,
      probability: previous?.probability ?? 20,
      photoUrl: player.photo || previous?.photoUrl,
      role: mapRole(player.position),
      shirtNumber: player.number ?? previous?.shirtNumber,
      status: previous?.status ?? ("bench" as const),
    } satisfies ProbablePlayer;
  });

  // Keep the editorial order of the probable XI. API squad responses are
  // grouped by role, not by the formation selected in the admin panel.
  const starters = current.players.map((player) => {
    const apiPlayer = importedPlayers.find((candidate) => samePlayerName(candidate.name, player.name));
    return apiPlayer
      ? { ...player, name: apiPlayer.name, photoUrl: apiPlayer.photoUrl, role: apiPlayer.role, shirtNumber: apiPlayer.shirtNumber, status: "starter" as const }
      : player;
  });
  const bench = importedPlayers
    .filter((player) => !starters.some((starter) => samePlayerName(starter.name, player.name)))
    .map((player) => ({ ...player, status: "bench" as const }));
  const manualBench = current.bench.filter(
    (player) => !importedPlayers.some((candidate) => samePlayerName(candidate.name, player.name)) &&
      !starters.some((starter) => samePlayerName(starter.name, player.name)),
  );

  return {
    ...current,
    apiTeamId: imported.team.id,
    players: dedupePlayers(starters),
    bench: dedupePlayers([...bench, ...manualBench]),
  };
}

function safeCount(value: number | null | undefined) {
  return Number.isFinite(value) && Number(value) > 0 ? Number(value) : 0;
}

function findApiTeam(siteName: string, teams: ApiTeam[]) {
  const wanted = normalizeTeam(siteName);
  return teams.find((entry) => normalizeTeam(entry.team.name) === wanted);
}

function findExistingPlayer(
  importedName: string,
  existingByName: Map<string, ProbablePlayer>,
) {
  const normalized = normalize(importedName);
  const exact = existingByName.get(normalized);
  if (exact) return exact;
  return Array.from(existingByName.entries()).find(
    ([name]) => name.endsWith(normalized) || normalized.endsWith(name),
  )?.[1];
}

export function samePlayerName(left: string, right: string) {
  const leftParts = normalize(left).split(" ").filter(Boolean);
  const rightParts = normalize(right).split(" ").filter(Boolean);
  if (leftParts.join(" ") === rightParts.join(" ")) return true;
  const leftLast = leftParts.at(-1);
  const rightLast = rightParts.at(-1);
  if (!leftLast || leftLast !== rightLast) return false;
  if (leftParts.length === 1 || rightParts.length === 1) return true;
  return leftParts[0][0] === rightParts[0][0];
}

function dedupePlayers(players: ProbablePlayer[]) {
  return players.filter(
    (player, index) => players.findIndex((candidate) => samePlayerName(candidate.name, player.name)) === index,
  );
}

function normalizeTeam(value: string) {
  const aliases: Record<string, string> = {
    "ac milan": "milan",
    "as roma": "roma",
    "como 1907": "como",
    "internazionale": "inter",
    "inter milan": "inter",
    "venezia fc": "venezia",
    "hellas verona": "verona",
  };
  const normalized = normalize(value);
  return aliases[normalized] ?? normalized;
}

export function sameTeamName(left: string, right: string) {
  return normalizeTeam(left) === normalizeTeam(right);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mapRole(position: string): PlayerRole {
  const value = position.toLowerCase();
  if (value.includes("goalkeeper")) return "Portiere";
  if (value.includes("defender")) return "Difensore";
  if (value.includes("attacker")) return "Attaccante";
  return "Centrocampista";
}

function hasApiErrors(errors: ApiEnvelope<unknown>["errors"]) {
  return Array.isArray(errors)
    ? errors.length > 0
    : Boolean(errors && Object.keys(errors).length > 0);
}

function formatApiErrors(errors: ApiEnvelope<unknown>["errors"]) {
  if (!errors) return "errore sconosciuto";
  return Array.isArray(errors)
    ? errors.join(", ")
    : Object.values(errors).join(", ");
}

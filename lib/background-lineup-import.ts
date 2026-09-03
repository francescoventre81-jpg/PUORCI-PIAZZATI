import { importSingleSquad, resolveItalianTeams, type ResolvedApiTeam } from "./api-football";
import { LINEUPS_CONFIG_SLUG } from "./lineup-content";
import { probableMatches, type ProbableMatch } from "./probable-lineups";
import { createAdminClient } from "./supabase/admin";

export const LINEUPS_IMPORT_STATE_SLUG = "configurazione-import-api-football";
const API_TEAM_RESOLUTION_VERSION = 2;

export type LineupsImportState = {
  attempts: Record<string, number>;
  completedAt?: string;
  failedTeams: string[];
  lastError?: string;
  nextTeamIndex: number;
  processedTeams: string[];
  resolutionVersion?: number;
  resolvedTeams?: ResolvedApiTeam[];
  skippedTeams: string[];
  startedAt: string;
  status: "idle" | "running" | "completed" | "failed";
  totalTeams: number;
};

export async function startBackgroundLineupImport(userId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const state: LineupsImportState = {
    attempts: {},
    failedTeams: [],
    nextTeamIndex: 0,
    processedTeams: [],
    skippedTeams: [],
    startedAt: now,
    status: "running",
    totalTeams: 20,
  };
  const common = stateArticle(state, userId, now);
  const { data: existing } = await admin
    .from("editorial_articles")
    .select("id")
    .eq("slug", LINEUPS_IMPORT_STATE_SLUG)
    .maybeSingle();
  const result = existing
    ? await admin.from("editorial_articles").update(common).eq("id", existing.id)
    : await admin.from("editorial_articles").insert({
        ...common,
        created_by: userId,
        slug: LINEUPS_IMPORT_STATE_SLUG,
      });
  if (result.error) throw new Error(result.error.message);
  return state;
}

export async function getBackgroundLineupImportState() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("editorial_articles")
    .select("body")
    .eq("slug", LINEUPS_IMPORT_STATE_SLUG)
    .maybeSingle();
  if (error || !data?.body) return null;
  return parseState(data.body);
}

export async function processBackgroundLineupImport() {
  const admin = createAdminClient();
  const { data: stateRow, error: stateError } = await admin
    .from("editorial_articles")
    .select("id,body,created_by,updated_by")
    .eq("slug", LINEUPS_IMPORT_STATE_SLUG)
    .maybeSingle();
  if (stateError) throw new Error(stateError.message);
  if (!stateRow?.body) {
    const { data: configOwner, error: configOwnerError } = await admin
      .from("editorial_articles")
      .select("created_by,updated_by")
      .eq("slug", LINEUPS_CONFIG_SLUG)
      .maybeSingle();
    if (configOwnerError) throw new Error(configOwnerError.message);
    let ownerId = configOwner?.updated_by ?? configOwner?.created_by;
    if (!ownerId) {
      const { data: firstAdmin, error: adminError } = await admin
        .from("admin_users")
        .select("user_id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (adminError) throw new Error(adminError.message);
      ownerId = firstAdmin?.user_id;
    }
    if (!ownerId) return { status: "idle" as const };
    await startBackgroundLineupImport(ownerId);
    return { status: "running" as const, phase: "started" };
  }

  const state = parseState(stateRow.body);
  if (!state || state.status !== "running") {
    return { status: state?.status ?? ("idle" as const) };
  }
  const ownerId = stateRow.updated_by ?? stateRow.created_by;
  if (!ownerId) throw new Error("Amministratore dell'importazione non disponibile.");

  const { data: configRow, error: configError } = await admin
    .from("editorial_articles")
    .select("id,body")
    .eq("slug", LINEUPS_CONFIG_SLUG)
    .maybeSingle();
  if (configError) throw new Error(configError.message);
  let matches = parseMatches(configRow?.body) ?? structuredClone(probableMatches);

  if (!state.resolvedTeams || state.resolutionVersion !== API_TEAM_RESOLUTION_VERSION) {
    const teamNames = Array.from(
      new Set(matches.flatMap((match) => [match.home.team, match.away.team])),
    );
    try {
      const resolution = await resolveItalianTeams(teamNames);
      state.resolvedTeams = resolution.resolvedTeams;
      state.resolutionVersion = API_TEAM_RESOLUTION_VERSION;
      state.skippedTeams = resolution.skippedTeams;
      state.totalTeams = resolution.resolvedTeams.length;
      state.nextTeamIndex = 0;
      state.processedTeams = [];
      state.failedTeams = [];
      state.attempts = {};
      state.lastError = undefined;
      await saveState(stateRow.id, state, ownerId);
      return { status: "running" as const, phase: "teams-resolved", total: state.totalTeams };
    } catch (error) {
      state.lastError = messageOf(error);
      await saveState(stateRow.id, state, ownerId);
      return { status: "running" as const, phase: "resolution-retry", error: state.lastError };
    }
  }

  const importedTeams: Array<{ name: string; players: number }> = [];
  for (let batchIndex = 0; batchIndex < 4; batchIndex += 1) {
    const entry = state.resolvedTeams[state.nextTeamIndex];
    if (!entry) {
      state.status = "completed";
      state.completedAt = new Date().toISOString();
      state.lastError = undefined;
      await saveState(stateRow.id, state, ownerId);
      return { status: "completed" as const, processed: state.processedTeams.length };
    }

    const location = findTeam(matches, entry.siteName);
    if (!location) {
      state.failedTeams.push(entry.siteName);
      state.nextTeamIndex += 1;
      state.lastError = `Squadra ${entry.siteName} non trovata nella configurazione.`;
      await saveState(stateRow.id, state, ownerId);
      continue;
    }

    try {
      const imported = await importSingleSquad(location.team, entry.apiTeamId);
      matches = matches.map((match, index) =>
        index === location.matchIndex
          ? { ...match, [location.side]: imported.team }
          : match,
      );
      await saveLineups(configRow?.id, matches, ownerId);
      state.processedTeams.push(entry.siteName);
      state.nextTeamIndex += 1;
      state.lastError = undefined;
      importedTeams.push({ name: entry.siteName, players: imported.importedPlayers });
      await saveState(stateRow.id, state, ownerId);
    } catch (error) {
      const errorMessage = messageOf(error);
      if (isApiLimitError(errorMessage)) {
        state.lastError = `${errorMessage} Il sistema riproverà automaticamente senza saltare ${entry.siteName}.`;
        await saveState(stateRow.id, state, ownerId);
        return {
          status: "running" as const,
          waitingForApiQuota: entry.siteName,
          error: state.lastError,
        };
      }
      const attempts = (state.attempts[entry.siteName] ?? 0) + 1;
      state.attempts[entry.siteName] = attempts;
      state.lastError = errorMessage;
      if (attempts >= 3) {
        state.failedTeams.push(entry.siteName);
        state.nextTeamIndex += 1;
      }
      await saveState(stateRow.id, state, ownerId);
      return { status: "running" as const, retrying: entry.siteName, attempts, error: state.lastError };
    }
  }

  return {
    status: "running" as const,
    importedTeams,
    progress: state.nextTeamIndex,
    total: state.totalTeams,
  };
}

async function saveLineups(id: string | undefined, matches: ProbableMatch[], userId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const common = {
    body: JSON.stringify(matches),
    updated_by: userId,
    published_at: now,
  };
  const result = id
    ? await admin.from("editorial_articles").update(common).eq("id", id)
    : await admin.from("editorial_articles").insert({
        ...common,
        category: "Configurazione",
        created_by: userId,
        fantasy_takeaway: null,
        reliability: "in_evolution",
        slug: LINEUPS_CONFIG_SLUG,
        sources: [],
        status: "published",
        summary: "Configurazione tecnica delle probabili formazioni gestita dalla redazione.",
        title: "Configurazione probabili formazioni",
      });
  if (result.error) throw new Error(result.error.message);
}

async function saveState(id: string, state: LineupsImportState, userId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin
    .from("editorial_articles")
    .update(stateArticle(state, userId, now))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

function stateArticle(state: LineupsImportState, userId: string, now: string) {
  return {
    body: JSON.stringify(state),
    category: "Configurazione",
    fantasy_takeaway: null,
    published_at: null,
    reliability: "in_evolution",
    sources: [],
    status: "draft",
    summary: "Stato tecnico dell'importazione automatica delle rose API-Football.",
    title: "Importazione automatica rose API-Football",
    updated_by: userId,
    updated_at: now,
  };
}

function parseState(value: string): LineupsImportState | null {
  try {
    const parsed = JSON.parse(value) as LineupsImportState;
    return parsed && typeof parsed.status === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function parseMatches(value?: string | null): ProbableMatch[] | null {
  try {
    const parsed = value ? JSON.parse(value) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed as ProbableMatch[] : null;
  } catch {
    return null;
  }
}

function findTeam(matches: ProbableMatch[], teamName: string) {
  for (let matchIndex = 0; matchIndex < matches.length; matchIndex += 1) {
    if (matches[matchIndex].home.team === teamName) return { matchIndex, side: "home" as const, team: matches[matchIndex].home };
    if (matches[matchIndex].away.team === teamName) return { matchIndex, side: "away" as const, team: matches[matchIndex].away };
  }
  return null;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Errore sconosciuto.";
}

function isApiLimitError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("too many requests") ||
    normalized.includes("request limit") ||
    normalized.includes("requests per minute") ||
    normalized.includes("requests per day") ||
    normalized.includes("rate limit") ||
    normalized.includes("quota")
  );
}

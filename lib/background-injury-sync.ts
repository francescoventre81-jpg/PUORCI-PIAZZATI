import {
  importSerieAInjuries,
  samePlayerName,
  sameTeamName,
  type ImportedInjury,
} from "./api-football";
import { LINEUPS_CONFIG_SLUG } from "./lineup-content";
import { type ProbableMatch } from "./probable-lineups";
import { createAdminClient } from "./supabase/admin";

export const INJURY_SYNC_STATE_SLUG = "configurazione-sync-infortuni-api-football";
const SUCCESS_INTERVAL_MS = 4 * 60 * 60 * 1000;
const ERROR_RETRY_INTERVAL_MS = 30 * 60 * 1000;

type AutomaticEntry = { playerName: string; teamName: string };
type InjurySyncState = {
  automaticEntries: AutomaticEntry[];
  lastAttemptAt: string;
  lastCount: number;
  lastError?: string;
  lastSuccessAt?: string;
  requestsUsed?: number;
};

export async function processAutomaticInjurySync() {
  const admin = createAdminClient();
  const { data: configRow, error: configError } = await admin
    .from("editorial_articles")
    .select("id,body,created_by,updated_by")
    .eq("slug", LINEUPS_CONFIG_SLUG)
    .maybeSingle();
  if (configError) throw new Error(configError.message);
  const matches = parseMatches(configRow?.body);
  if (!configRow?.id || !matches) return { status: "idle" as const, reason: "lineups-not-configured" };

  const { data: stateRow, error: stateError } = await admin
    .from("editorial_articles")
    .select("id,body")
    .eq("slug", INJURY_SYNC_STATE_SLUG)
    .maybeSingle();
  if (stateError) throw new Error(stateError.message);
  const previous = parseState(stateRow?.body);
  const now = new Date();
  const interval = previous?.lastError ? ERROR_RETRY_INTERVAL_MS : SUCCESS_INTERVAL_MS;
  if (previous && now.getTime() - new Date(previous.lastAttemptAt).getTime() < interval) {
    return { status: "waiting" as const, lastSuccessAt: previous.lastSuccessAt };
  }

  const ownerId = configRow.updated_by ?? configRow.created_by ?? await firstAdminId();
  if (!ownerId) throw new Error("Amministratore della configurazione non disponibile.");

  const attemptState: InjurySyncState = {
    automaticEntries: previous?.automaticEntries ?? [],
    lastAttemptAt: now.toISOString(),
    lastCount: previous?.lastCount ?? 0,
    lastSuccessAt: previous?.lastSuccessAt,
  };
  const stateId = await saveState(stateRow?.id, attemptState, ownerId);

  try {
    const imported = await importSerieAInjuries();
    const nextMatches = applyAutomaticInjuries(
      matches,
      imported.injuries,
      previous?.automaticEntries ?? [],
    );
    const automaticEntries = imported.injuries.flatMap((injury) => {
      const siteTeam = siteTeamName(nextMatches, injury.teamName);
      return siteTeam ? [{ playerName: injury.playerName, teamName: siteTeam }] : [];
    });
    const completedAt = new Date().toISOString();
    const { error: updateError } = await admin
      .from("editorial_articles")
      .update({ body: JSON.stringify(nextMatches), published_at: completedAt, updated_by: ownerId })
      .eq("id", configRow.id);
    if (updateError) throw new Error(updateError.message);
    await saveState(stateId, {
      automaticEntries,
      lastAttemptAt: attemptState.lastAttemptAt,
      lastCount: automaticEntries.length,
      lastSuccessAt: completedAt,
      requestsUsed: imported.requestsUsed,
    }, ownerId);
    return {
      status: "completed" as const,
      injuries: automaticEntries.length,
      requestsUsed: imported.requestsUsed,
    };
  } catch (error) {
    const failed: InjurySyncState = {
      ...attemptState,
      lastError: error instanceof Error ? error.message : "Aggiornamento non riuscito.",
    };
    await saveState(stateId, failed, ownerId);
    return { status: "retrying" as const, error: failed.lastError };
  }
}

function applyAutomaticInjuries(
  matches: ProbableMatch[],
  injuries: ImportedInjury[],
  previousEntries: AutomaticEntry[],
) {
  return matches.map((match) => ({
    ...match,
    unavailable: {
      home: mergeTeamInjuries(match.home.team, match.unavailable.home, injuries, previousEntries),
      away: mergeTeamInjuries(match.away.team, match.unavailable.away, injuries, previousEntries),
    },
    updatedAt: formatUpdatedAt(new Date()),
  }));
}

function mergeTeamInjuries(
  teamName: string,
  current: string[],
  injuries: ImportedInjury[],
  previousEntries: AutomaticEntry[],
) {
  const previousNames = previousEntries
    .filter((entry) => sameTeamName(entry.teamName, teamName))
    .map((entry) => entry.playerName);
  const manualEntries = current.filter((entry) => {
    const name = entry.split(" — ")[0]?.trim() ?? entry;
    return !previousNames.some((previous) => samePlayerName(previous, name));
  });
  const automatic = injuries
    .filter((injury) => sameTeamName(injury.teamName, teamName))
    .map(formatInjury);
  return Array.from(new Set([...manualEntries, ...automatic]));
}

function formatInjury(injury: ImportedInjury) {
  const status = translateType(injury.type);
  const detail = translateReason(injury.reason);
  return `${injury.playerName} — ${status} — ${detail}`;
}

function translateType(value?: string) {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("susp")) return "Squalificato";
  if (normalized.includes("doubt")) return "In dubbio";
  return "Infortunato";
}

function translateReason(value?: string) {
  if (!value) return "Motivo non comunicato dalla fonte";
  const normalized = value.toLowerCase();
  const translations: Array<[string, string]> = [
    ["knee", "Problema al ginocchio"],
    ["hamstring", "Problema muscolare ai flessori"],
    ["muscle", "Problema muscolare"],
    ["ankle", "Problema alla caviglia"],
    ["calf", "Problema al polpaccio"],
    ["thigh", "Problema alla coscia"],
    ["groin", "Problema all'inguine"],
    ["shoulder", "Problema alla spalla"],
    ["back", "Problema alla schiena"],
    ["red card", "Squalifica per espulsione"],
    ["yellow card", "Squalifica per ammonizioni"],
  ];
  return translations.find(([needle]) => normalized.includes(needle))?.[1] ?? value;
}

function siteTeamName(matches: ProbableMatch[], apiName: string) {
  return matches
    .flatMap((match) => [match.home.team, match.away.team])
    .find((team) => sameTeamName(team, apiName));
}

function parseMatches(value?: string | null): ProbableMatch[] | null {
  try {
    const parsed = value ? JSON.parse(value) : null;
    return Array.isArray(parsed) && parsed.length ? parsed as ProbableMatch[] : null;
  } catch {
    return null;
  }
}

function parseState(value?: string | null): InjurySyncState | null {
  try {
    const parsed = value ? JSON.parse(value) as InjurySyncState : null;
    return parsed?.lastAttemptAt ? parsed : null;
  } catch {
    return null;
  }
}

async function firstAdminId() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_users")
    .select("user_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.user_id;
}

async function saveState(id: string | undefined, state: InjurySyncState, userId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const common = {
    body: JSON.stringify(state),
    category: "Configurazione",
    fantasy_takeaway: null,
    published_at: null,
    reliability: "in_evolution",
    sources: [],
    status: "draft",
    summary: "Stato tecnico dell'aggiornamento automatico di infortuni e squalifiche.",
    title: "Aggiornamento automatico infortuni API-Football",
    updated_at: now,
    updated_by: userId,
  };
  const result = id
    ? await admin.from("editorial_articles").update(common).eq("id", id).select("id").single()
    : await admin.from("editorial_articles").insert({
        ...common,
        created_by: userId,
        slug: INJURY_SYNC_STATE_SLUG,
      }).select("id").single();
  if (result.error) throw new Error(result.error.message);
  return result.data.id as string;
}

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(date);
}

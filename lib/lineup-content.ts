import { createClient } from "@/lib/supabase/server";
import {
  getPlayerSlug,
  probableMatches,
  type ProbableMatch,
} from "@/lib/probable-lineups";
import { samePlayerName } from "@/lib/api-football";
import { enrichVerifiedAvailability } from "@/lib/verified-availability";

export const LINEUPS_CONFIG_SLUG = "configurazione-probabili-formazioni";

export async function getManagedProbableMatches(): Promise<ProbableMatch[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("editorial_articles")
      .select("body")
      .eq("slug", LINEUPS_CONFIG_SLUG)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data?.body) return sanitizeMatches(probableMatches);
    const parsed = JSON.parse(data.body) as unknown;
    return isProbableMatches(parsed) ? sanitizeMatches(parsed) : sanitizeMatches(probableMatches);
  } catch {
    return sanitizeMatches(probableMatches);
  }
}

function sanitizeMatches(matches: ProbableMatch[]) {
  return matches.map((match) => {
    const fallback = probableMatches.find((candidate) => candidate.slug === match.slug);
    return {
      ...match,
      home: sanitizeLineup(match.home, fallback?.home),
      away: sanitizeLineup(match.away, fallback?.away),
      unavailable: {
        home: enrichVerifiedAvailability(match.home.team, match.unavailable.home),
        away: enrichVerifiedAvailability(match.away.team, match.unavailable.away),
      },
    };
  });
}

function sanitizeLineup(lineup: ProbableMatch["home"], fallback?: ProbableMatch["home"]) {
  let starters = dedupe(lineup.players).slice(0, 11);
  if ((starters.length < 11 || !hasFormationOrder(starters, lineup.formation)) && fallback) {
    const completeRoster = [...lineup.players, ...lineup.bench];
    starters = fallback.players.map((player) => {
      const imported = completeRoster.find((candidate) => samePlayerName(candidate.name, player.name));
      return imported
        ? { ...player, name: imported.name, photoUrl: imported.photoUrl, role: imported.role ?? player.role, shirtNumber: imported.shirtNumber ?? player.shirtNumber }
        : player;
    });
  }
  return {
    ...lineup,
    players: starters,
    bench: dedupe(lineup.bench).filter(
      (player) => !starters.some((starter) => samePlayerName(starter.name, player.name)),
    ),
  };
}

function hasFormationOrder(players: ProbableMatch["home"]["players"], formation: string) {
  if (players.length !== 11 || players[0]?.role !== "Portiere") return false;
  const lines = formation.split("-").map(Number);
  const defenders = lines[0] ?? 0;
  const forwards = lines.at(-1) ?? 0;
  return (
    players.slice(1, 1 + defenders).every((player) => player.role === "Difensore") &&
    players.slice(11 - forwards).every((player) => player.role === "Attaccante")
  );
}

function dedupe(players: ProbableMatch["home"]["players"]) {
  const result: typeof players = [];
  for (const player of players) {
    const duplicateIndex = result.findIndex((candidate) => samePlayerName(candidate.name, player.name));
    if (duplicateIndex < 0) {
      result.push(player);
      continue;
    }
    const current = result[duplicateIndex];
    if (!current.photoUrl && player.photoUrl) result[duplicateIndex] = player;
  }
  return result;
}

export async function getManagedProbableMatch(slug: string) {
  return (await getManagedProbableMatches()).find((match) => match.slug === slug);
}

export async function getManagedProbablePlayers() {
  const matches = await getManagedProbableMatches();
  const players = matches.flatMap((match) =>
    [match.home, match.away].flatMap((lineup) =>
      [...lineup.players, ...lineup.bench].map((player) => ({
        ...player,
        matchLabel: `${match.home.team} - ${match.away.team}`,
        matchSlug: match.slug,
        slug: getPlayerSlug(lineup.team, player.name),
        team: lineup.team,
        updatedAt: match.updatedAt,
      })),
    ),
  );
  return Array.from(new Map(players.map((player) => [player.slug, player])).values());
}

export async function getManagedProbablePlayer(slug: string) {
  return (await getManagedProbablePlayers()).find((player) => player.slug === slug);
}

function isProbableMatches(value: unknown): value is ProbableMatch[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) return false;
  return value.every((match) => {
    if (!match || typeof match !== "object") return false;
    const row = match as Partial<ProbableMatch>;
    return (
      typeof row.slug === "string" &&
      typeof row.dateLabel === "string" &&
      typeof row.timeLabel === "string" &&
      isTeam(row.home) &&
      isTeam(row.away) &&
      Boolean(row.unavailable && Array.isArray(row.unavailable.home) && Array.isArray(row.unavailable.away))
    );
  });
}

function isTeam(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const team = value as ProbableMatch["home"];
  return (
    typeof team.team === "string" &&
    typeof team.formation === "string" &&
    Array.isArray(team.players) &&
    Array.isArray(team.bench)
  );
}

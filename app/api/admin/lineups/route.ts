import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { LINEUPS_CONFIG_SLUG } from "@/lib/lineup-content";
import type { ProbableMatch, ProbablePlayer } from "@/lib/probable-lineups";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Accesso negato." }, { status: 403 });

  const body = (await request.json()) as { matches?: unknown };
  const matches = sanitizeMatches(body.matches);
  if (!matches) {
    return NextResponse.json({ error: "Dati delle formazioni non validi." }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: existing } = await admin
    .from("editorial_articles")
    .select("id")
    .eq("slug", LINEUPS_CONFIG_SLUG)
    .maybeSingle();
  const common = {
    updated_by: user.id,
    title: "Configurazione probabili formazioni",
    category: "Configurazione",
    summary: "Configurazione tecnica delle probabili formazioni gestita dalla redazione.",
    body: JSON.stringify(matches),
    fantasy_takeaway: null,
    reliability: "in_evolution",
    sources: [],
    status: "published",
    published_at: now,
  };

  const result = existing
    ? await admin.from("editorial_articles").update(common).eq("id", existing.id)
    : await admin.from("editorial_articles").insert({
        ...common,
        created_by: user.id,
        slug: LINEUPS_CONFIG_SLUG,
      });

  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ message: "Probabili formazioni pubblicate." });
}

function sanitizeMatches(value: unknown): ProbableMatch[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) return null;
  try {
    return value.map((entry) => {
      const match = entry as ProbableMatch;
      const home = sanitizeTeam(match.home);
      const away = sanitizeTeam(match.away);
      if (!home || !away || !clean(match.slug)) throw new Error("invalid");
      return {
        slug: clean(match.slug),
        dateLabel: clean(match.dateLabel),
        timeLabel: clean(match.timeLabel),
        stadium: clean(match.stadium),
        note: clean(match.note),
        sourceUrl: /^https:\/\//.test(clean(match.sourceUrl)) ? clean(match.sourceUrl) : "https://www.gazzetta.it/Calcio/prob_form/",
        updatedAt: new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date()),
        home,
        away,
        unavailable: {
          home: sanitizeNotes(match.unavailable?.home),
          away: sanitizeNotes(match.unavailable?.away),
        },
      };
    });
  } catch {
    return null;
  }
}

function sanitizeTeam(value: ProbableMatch["home"] | undefined) {
  if (!value || !clean(value.team) || !clean(value.formation)) return null;
  return {
    appearances: safeOptionalCount(value.appearances),
    apiTeamId: safePositiveInteger(value.apiTeamId),
    team: clean(value.team),
    formation: clean(value.formation),
    players: sanitizePlayers(value.players, "starter"),
    bench: sanitizePlayers(value.bench, "bench"),
  };
}

function sanitizePlayers(value: ProbablePlayer[] | undefined, status: "starter" | "bench") {
  if (!Array.isArray(value) || value.length > 40) throw new Error("invalid");
  return value.map((player) => ({
    apiPlayerId: safePositiveInteger(player.apiPlayerId),
    name: clean(player.name).slice(0, 80),
    probability: Math.min(100, Math.max(0, Number(player.probability) || (status === "starter" ? 80 : 25))),
    photoUrl: /^https:\/\//.test(clean(player.photoUrl)) || clean(player.photoUrl).startsWith("/players/") ? clean(player.photoUrl) : undefined,
    role: ["Portiere", "Difensore", "Centrocampista", "Attaccante"].includes(clean(player.role)) ? player.role : undefined,
    shirtNumber: Number.isInteger(Number(player.shirtNumber)) && Number(player.shirtNumber) > 0 && Number(player.shirtNumber) < 100 ? Number(player.shirtNumber) : undefined,
    stats: sanitizeStats(player.stats),
    status,
  }));
}

function sanitizeStats(value: ProbablePlayer["stats"]) {
  if (!value) return undefined;
  return {
    assists: safeCount(value.assists),
    goals: safeCount(value.goals),
    penalties: safeCount(value.penalties),
    ratedAppearances: safeOptionalCount(value.ratedAppearances),
    redCards: safeCount(value.redCards),
    season: safeCount(value.season),
    source: clean(value.source).slice(0, 60) || undefined,
    starts: safeOptionalCount(value.starts),
    substituteAppearances: safeOptionalCount(value.substituteAppearances),
    updatedAt: clean(value.updatedAt).slice(0, 40),
    yellowCards: safeCount(value.yellowCards),
  };
}

function safeOptionalCount(value: unknown) {
  return value === undefined || value === null ? undefined : safeCount(value);
}

function safeCount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

function safePositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function sanitizeNotes(value: string[] | undefined) {
  return Array.isArray(value) ? value.map((item) => clean(item).slice(0, 180)).filter(Boolean).slice(0, 30) : [];
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

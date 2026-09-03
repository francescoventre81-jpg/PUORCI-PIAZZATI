import { applyFantacalcioStatistics, FANTACALCIO_STATS_URL, fetchFantacalcioStatistics } from "./fantacalcio-statistics";
import { getManagedProbableMatches, LINEUPS_CONFIG_SLUG } from "./lineup-content";
import { applySerieAPlayingTime, fetchSerieAPlayingTime, FOTMOB_SERIE_A_URL } from "./fotmob-playing-time";
import { createAdminClient } from "./supabase/admin";

const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export async function processAutomaticStatisticsSync(force = false) {
  const matches = await getManagedProbableMatches();
  const newestUpdate = matches
    .flatMap((match) => [match.home, match.away])
    .flatMap((team) => [...team.players, ...team.bench])
    .map((player) => player.stats?.source?.includes("tabellini") ? Date.parse(player.stats.updatedAt) : 0)
    .reduce((latest, value) => Math.max(latest, Number.isFinite(value) ? value : 0), 0);
  if (!force && newestUpdate && Date.now() - newestUpdate < MAX_AGE_MS) {
    return { status: "fresh" as const, updatedAt: new Date(newestUpdate).toISOString() };
  }

  const rows = await fetchFantacalcioStatistics();
  const fantasyResult = applyFantacalcioStatistics(matches, rows);
  if (!fantasyResult.updatedPlayers) throw new Error("Nessun calciatore è stato associato alle statistiche Fantacalcio.");
  const playingTimeRows = await fetchSerieAPlayingTime();
  const result = applySerieAPlayingTime(fantasyResult.matches, playingTimeRows);

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin.from("editorial_articles").select("id,created_by,updated_by").eq("slug", LINEUPS_CONFIG_SLUG).maybeSingle();
  if (readError) throw new Error(readError.message);
  let ownerId = existing?.updated_by ?? existing?.created_by;
  if (!ownerId) {
    const { data: firstAdmin, error: adminError } = await admin.from("admin_users").select("user_id").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (adminError) throw new Error(adminError.message);
    ownerId = firstAdmin?.user_id;
  }
  if (!ownerId) throw new Error("Amministratore non disponibile per salvare le statistiche.");

  const common = {
    body: JSON.stringify(result.matches),
    category: "Configurazione",
    fantasy_takeaway: null,
    published_at: fantasyResult.updatedAt,
    reliability: "high",
    sources: [{ label: "Fantacalcio.it — voti e bonus/malus", url: FANTACALCIO_STATS_URL }, { label: "FotMob — tabellini Serie A", url: FOTMOB_SERIE_A_URL }],
    status: "published",
    summary: "Probabili formazioni e statistiche stagionali aggiornate.",
    title: "Configurazione probabili formazioni",
    updated_by: ownerId,
  };
  const saved = existing
    ? await admin.from("editorial_articles").update(common).eq("id", existing.id)
    : await admin.from("editorial_articles").insert({ ...common, created_by: ownerId, slug: LINEUPS_CONFIG_SLUG });
  if (saved.error) throw new Error(saved.error.message);
  return { status: "updated" as const, sourceRows: rows.length, ratedPlayers: fantasyResult.updatedPlayers, playingTimePlayers: result.updatedPlayers, updatedAt: fantasyResult.updatedAt };
}

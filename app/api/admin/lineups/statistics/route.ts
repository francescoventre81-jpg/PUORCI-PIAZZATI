import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { applyFantacalcioStatistics, FANTACALCIO_STATS_URL, fetchFantacalcioStatistics } from "@/lib/fantacalcio-statistics";
import { getManagedProbableMatches, LINEUPS_CONFIG_SLUG } from "@/lib/lineup-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { applySerieAPlayingTime, fetchSerieAPlayingTime, FOTMOB_SERIE_A_URL } from "@/lib/fotmob-playing-time";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Accesso negato." }, { status: 403 });
  const { teamName } = (await request.json()) as { teamName?: string };
  if (!teamName?.trim()) return NextResponse.json({ error: "Squadra non indicata." }, { status: 400 });

  try {
    const matches = await getManagedProbableMatches();
    const rows = await fetchFantacalcioStatistics();
    const imported = applyFantacalcioStatistics(matches, rows, teamName);
    if (!imported.updatedPlayers) return NextResponse.json({ error: "Nessun calciatore della squadra è stato associato alla fonte Fantacalcio." }, { status: 404 });
    const playingTime = applySerieAPlayingTime(imported.matches, await fetchSerieAPlayingTime(teamName), teamName);

    const admin = createAdminClient();
    const now = new Date().toISOString();
    const { data: existing } = await admin.from("editorial_articles").select("id").eq("slug", LINEUPS_CONFIG_SLUG).maybeSingle();
    const common = {
      body: JSON.stringify(playingTime.matches),
      category: "Configurazione",
      fantasy_takeaway: null,
      published_at: now,
      reliability: "in_evolution",
      sources: [{ label: "Fantacalcio.it — voti e bonus/malus", url: FANTACALCIO_STATS_URL }, { label: "FotMob — tabellini Serie A", url: FOTMOB_SERIE_A_URL }],
      status: "published",
      summary: "Configurazione tecnica delle probabili formazioni e statistiche.",
      title: "Configurazione probabili formazioni",
      updated_by: user.id,
    };
    const result = existing
      ? await admin.from("editorial_articles").update(common).eq("id", existing.id)
      : await admin.from("editorial_articles").insert({ ...common, created_by: user.id, slug: LINEUPS_CONFIG_SLUG });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ message: `${teamName}: voti, titolarità e subentri 2026/27 aggiornati.`, matches: playingTime.matches });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Aggiornamento statistiche non riuscito." }, { status: 502 });
  }
}

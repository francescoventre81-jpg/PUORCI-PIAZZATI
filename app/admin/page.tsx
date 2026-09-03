import { EditorialAdminPanel } from "@/components/editorial-admin-panel";
import { LineupsAdminPanel } from "@/components/lineups-admin-panel";
import { requireAdminPage } from "@/lib/admin-auth";
import { LINEUPS_IMPORT_STATE_SLUG } from "@/lib/background-lineup-import";
import { INJURY_SYNC_STATE_SLUG } from "@/lib/background-injury-sync";
import { getManagedProbableMatches, LINEUPS_CONFIG_SLUG } from "@/lib/lineup-content";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Amministrazione",
  description: "Control room editoriale PUORCIPIAZZATI.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminPage();
  const admin = createAdminClient();
  const [{ data: articles, error: articlesError }, { data: advice, error: adviceError }, managedMatches] =
    await Promise.all([
      admin
        .from("editorial_articles")
        .select("id,title,slug,category,summary,body,fantasy_takeaway,reliability,image_path,sources,status,published_at")
        .neq("slug", LINEUPS_CONFIG_SLUG)
        .neq("slug", LINEUPS_IMPORT_STATE_SLUG)
        .neq("slug", INJURY_SYNC_STATE_SLUG)
        .order("created_at", { ascending: false }),
      admin
        .from("editorial_advice")
        .select("id,subject,category,matchday,status,reason,match_label,image_path,published_at")
        .order("created_at", { ascending: false }),
      getManagedProbableMatches(),
    ]);

  return (
    <section className="admin-shell">
      <div className="container admin-heading">
        <span>PUORCIPIAZZATI CONTROL ROOM</span>
        <h1>Control room editoriale</h1>
        <p>
          Aggiorna probabili formazioni, rose, statistiche, consigli e notizie
          pubblicate sul portale.
        </p>
      </div>
      <div className="container admin-sections">
        <LineupsAdminPanel initialMatches={managedMatches} />
        <EditorialAdminPanel
          advice={advice ?? []}
          articles={articles ?? []}
          databaseReady={!articlesError && !adviceError}
        />
      </div>
    </section>
  );
}

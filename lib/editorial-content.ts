import { createClient } from "@/lib/supabase/server";
import type { EditorialNews } from "@/lib/editorial-data";
import { LINEUPS_CONFIG_SLUG } from "@/lib/lineup-content";

export type PublishedAdvice = {
  category: "start" | "avoid" | "differential" | "top" | "flop";
  id: string;
  imageUrl?: string;
  matchLabel?: string;
  matchday: number;
  reason: string;
  subject: string;
};

export async function getPublishedArticles(): Promise<EditorialNews[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("editorial_articles")
      .select("title,slug,category,summary,body,fantasy_takeaway,reliability,image_path,sources,published_at")
      .eq("status", "published")
      .neq("slug", LINEUPS_CONFIG_SLUG)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });
    if (error) return [];

    return (data ?? []).map((row) => ({
      category: row.category,
      slug: row.slug,
      publishedLabel: formatPublishedDate(row.published_at),
      reliability: reliabilityLabel(row.reliability),
      title: row.title,
      summary: row.summary,
      fantasyTakeaway: row.fantasy_takeaway ?? "Consulta l’analisi completa prima di decidere.",
      decisionSupport: { action: "", flipSignal: "", hiddenEdge: "", verdict: "" },
      sections: [{ heading: "Analisi", body: row.body }],
      sources: Array.isArray(row.sources) ? row.sources : [],
      imageUrl: publicImageUrl(supabase, row.image_path),
    }));
  } catch {
    return [];
  }
}

export async function getPublishedArticle(slug: string) {
  const articles = await getPublishedArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getPublishedAdvice(): Promise<PublishedAdvice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("editorial_advice")
      .select("id,matchday,category,subject,reason,match_label,image_path")
      .eq("status", "published")
      .order("matchday", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data ?? []).map((row) => ({
      id: row.id,
      matchday: row.matchday,
      category: row.category,
      subject: row.subject,
      reason: row.reason,
      matchLabel: row.match_label ?? undefined,
      imageUrl: publicImageUrl(supabase, row.image_path),
    }));
  } catch {
    return [];
  }
}

function publicImageUrl(supabase: Awaited<ReturnType<typeof createClient>>, path: string | null) {
  return path
    ? supabase.storage.from("editorial-images").getPublicUrl(path).data.publicUrl
    : undefined;
}

function formatPublishedDate(value: string | null) {
  if (!value) return "Pubblicato ora";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(new Date(value));
}

function reliabilityLabel(value: string): EditorialNews["reliability"] {
  if (value === "high") return "Alta";
  if (value === "medium") return "Media";
  return "In evoluzione";
}

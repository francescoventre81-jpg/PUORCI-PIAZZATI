import { PUBLIC_SITE_URL } from "@/lib/site-url";
import { editorialNews } from "@/lib/editorial-data";
import { getManagedProbableMatches, getManagedProbablePlayers } from "@/lib/lineup-content";

const publicUrl = PUBLIC_SITE_URL;
const lastModified = "2026-08-27";

export async function GET() {
  const [probableMatches, probablePlayers] = await Promise.all([
    getManagedProbableMatches(),
    getManagedProbablePlayers(),
  ]);
  const pages = [
    { path: "", changeFrequency: "daily", priority: "1.0" },
    ...probableMatches.map(({ slug }) => ({
    path: `/formazioni/${slug}`,
    changeFrequency: "daily",
    priority: "0.8",
  })),
  ...editorialNews.map(({ slug }) => ({
    path: `/news/${slug}`,
    changeFrequency: "weekly",
    priority: "0.8",
  })),
    ...probablePlayers.map(({ slug }) => ({
    path: `/giocatori/${slug}`,
    changeFrequency: "daily",
    priority: "0.7",
  })),
  ];
  const urls = pages
    .map(
      ({ path, changeFrequency, priority }) => `  <url>
    <loc>${publicUrl}${path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

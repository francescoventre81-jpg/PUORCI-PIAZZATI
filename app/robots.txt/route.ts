import { PUBLIC_SITE_URL } from "@/lib/site-url";

const publicUrl = PUBLIC_SITE_URL;

export function GET() {
  const body = [
    "User-agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /iscrizione",
    "Disallow: /auth/",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /iscrizione",
    "Disallow: /auth/",
    "",
    `Sitemap: ${publicUrl}/sitemap.xml`,
    `Host: ${publicUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

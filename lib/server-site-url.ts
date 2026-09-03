import { PUBLIC_SITE_URL } from "@/lib/site-url";

export function getPublicSiteUrl() {
  return process.env.APP_URL?.replace(/\/$/, "") || PUBLIC_SITE_URL;
}

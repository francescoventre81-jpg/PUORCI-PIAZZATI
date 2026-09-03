import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PUBLIC_SITE_URL } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

const publicUrl = PUBLIC_SITE_URL;
const title = "PUORCIPIAZZATI — Il calcio, senza filtri";
const description =
  "PUORCIPIAZZATI è la piattaforma sportiva per calcio, fantacalcio, probabili formazioni, mercato, statistiche e confronto tra fonti.";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(publicUrl),
    title: {
      default: title,
      template: "%s | PUORCIPIAZZATI",
    },
    description,
    applicationName: "PUORCIPIAZZATI",
    keywords: [
      "PUORCIPIAZZATI",
      "calcio",
      "calciomercato",
      "probabili formazioni",
      "statistiche calcio",
      "fantacalcio",
      "fantacalcio 2026/2027",
      "lega fantacalcio",
    ],
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "it_IT",
      siteName: "PUORCIPIAZZATI",
      url: publicUrl,
      images: [
        {
          url: new URL("/og.png", publicUrl).toString(),
          width: 1200,
          height: 630,
          alt: "PUORCIPIAZZATI — Il calcio, senza filtri",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", publicUrl).toString()],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${publicUrl}/#website`,
        name: "PUORCIPIAZZATI",
        alternateName: ["Puorci Piazzati", "PuorciPiazzati", "PP"],
        url: `${publicUrl}/`,
        description,
        inLanguage: "it-IT",
        publisher: { "@id": `${publicUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${publicUrl}/cerca?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "SportsOrganization"],
        "@id": `${publicUrl}/#organization`,
        name: "PUORCIPIAZZATI",
        alternateName: ["Puorci Piazzati", "PuorciPiazzati", "PP", "puorcipiazzati.it"],
        slogan: "Il calcio, senza filtri",
        knowsAbout: ["calcio", "fantacalcio", "probabili formazioni", "calciomercato", "statistiche sportive"],
        url: `${publicUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${publicUrl}/puorcipiazzati-logo.png`,
        },
      },
    ],
  };

  return (
    <html lang="it">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
        <SiteHeader isAuthenticated={Boolean(user?.email_confirmed_at)} />
        <main>{children}</main>
        <SiteFooter />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

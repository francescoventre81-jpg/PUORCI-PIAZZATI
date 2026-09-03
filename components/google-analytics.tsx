"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MEASUREMENT_ID = "G-52FMKSBSLY";
const CONSENT_STORAGE_KEY = "fantapuorci-analytics-consent";
const OPEN_SETTINGS_EVENT = "fantapuorci:open-cookie-settings";

type ConsentChoice = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function ensureGoogleTag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
}

function updateConsent(choice: Exclude<ConsentChoice, null>) {
  ensureGoogleTag();
  window.gtag("consent", "update", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: choice,
  });
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [hydrated, setHydrated] = useState(false);
  const [tagReady, setTagReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    ensureGoogleTag();
    window.gtag("consent", "default", {
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });

    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      setChoice(stored);
      updateConsent(stored);
    }
    setHydrated(true);

    const openSettings = () => setSettingsOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  useEffect(() => {
    if (!tagReady || choice !== "granted") return;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: pathname,
      page_title: document.title,
    });
  }, [choice, pathname, tagReady]);

  useEffect(() => {
    if (!tagReady || choice !== "granted") return;

    const trackMarkedAction = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const marked = target.closest<HTMLElement>("[data-analytics-event]");
      if (!marked) return;

      window.gtag("event", marked.dataset.analyticsEvent, {
        event_label: marked.dataset.analyticsLabel,
      });
    };

    document.addEventListener("click", trackMarkedAction);
    return () => document.removeEventListener("click", trackMarkedAction);
  }, [choice, tagReady]);

  function saveChoice(nextChoice: Exclude<ConsentChoice, null>) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
    setChoice(nextChoice);
    setSettingsOpen(false);
    updateConsent(nextChoice);
  }

  const showBanner = hydrated && (choice === null || settingsOpen);

  return (
    <>
      {choice === "granted" ? (
        <Script
          id="fantapuorci-google-analytics"
          onLoad={() => {
            ensureGoogleTag();
            updateConsent("granted");
            window.gtag("js", new Date());
            window.gtag("config", MEASUREMENT_ID, {
              anonymize_ip: true,
              send_page_view: false,
            });
            setTagReady(true);
          }}
          src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
      ) : null}

      {showBanner ? (
        <aside
          aria-label="Preferenze cookie"
          aria-live="polite"
          className="cookie-consent"
        >
          <div>
            <strong>COOKIE E STATISTICHE</strong>
            <p>
              Usiamo Google Analytics soltanto con il tuo consenso per capire
              quante persone visitano il sito e quali pagine vengono utilizzate.
              Non inviamo nomi, email o dati di pagamento.
            </p>
          </div>
          <div className="cookie-consent-actions">
            <button onClick={() => saveChoice("denied")} type="button">
              SOLO NECESSARI
            </button>
            <button
              className="cookie-accept"
              onClick={() => saveChoice("granted")}
              type="button"
            >
              ACCETTA ANALYTICS
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

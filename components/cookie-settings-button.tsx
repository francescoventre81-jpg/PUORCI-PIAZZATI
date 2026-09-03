"use client";

import { openCookieSettings } from "./google-analytics";

export function CookieSettingsButton() {
  return (
    <button className="cookie-settings-button" onClick={openCookieSettings} type="button">
      Gestisci cookie
    </button>
  );
}

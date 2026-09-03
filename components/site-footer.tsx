import { CookieSettingsButton } from "./cookie-settings-button";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Logo />
        <div className="footer-meta">
          <span>© 2026 PUORCIPIAZZATI. Tutti i diritti riservati.</span>
          <CookieSettingsButton />
        </div>
      </div>
    </footer>
  );
}

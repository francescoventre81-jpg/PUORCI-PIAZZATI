import Image from "next/image";
import Link from "next/link";
import { ArrowDown, BarChart3, Newspaper, ShieldCheck } from "lucide-react";

export function PortalHero() {
  return (
    <section className="portal-hero">
      <div className="portal-hero-grid" aria-hidden="true" />
      <div className="portal-hero-glow" aria-hidden="true" />
      <div className="container portal-hero-inner">
        <div className="portal-hero-copy">
          <div className="portal-live-label">
            <span /> Calcio · Fantacalcio · Cultura
          </div>
          <h1>
            IL CALCIO,
            <strong>SENZA FILTRI.</strong>
          </h1>
          <p>
            Notizie ragionate, probabili formazioni, mercato e statistiche per
            chi il calcio lo vive ogni giorno.
          </p>
          <div className="portal-hero-actions">
            <Link className="portal-primary-cta" href="#probabili-formazioni">
              Scopri le probabili formazioni <ArrowDown size={18} />
            </Link>
            <Link className="portal-secondary-cta" href="#news">
              Leggi le ultime news <Newspaper size={18} />
            </Link>
          </div>
          <div className="portal-hero-features" aria-label="Caratteristiche del portale">
            <span><BarChart3 size={16} /> Dati che contano</span>
            <span><ShieldCheck size={16} /> Fonti incrociate</span>
            <span><Newspaper size={16} /> Analisi originali</span>
          </div>
        </div>

        <div className="portal-hero-visual" aria-hidden="true">
          <div className="portal-logo-halo">
            <Image
              alt=""
              height={420}
              priority
              src="/puorcipiazzati-logo.png"
              unoptimized
              width={420}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

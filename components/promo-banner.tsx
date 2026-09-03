"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PromoCountdown } from "@/components/promo-countdown";
import {
  EARLY_BIRD_PRICE_EUR,
  STANDARD_PRICE_EUR,
  STANDARD_PRICE_START,
  type RegistrationPrice,
} from "@/lib/pricing-config";

export function PromoBanner({ price }: { price: RegistrationPrice }) {
  const [standard, setStandard] = useState(price.tier === "standard");

  useEffect(() => {
    if (standard) return;
    const target = new Date(STANDARD_PRICE_START).getTime();
    const update = () => setStandard(Date.now() >= target);
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [standard]);

  if (standard) {
    return (
      <aside className="promo-banner standard">
        <div className="container promo-banner-inner">
          <strong>QUOTA DI ISCRIZIONE: {STANDARD_PRICE_EUR} €</strong>
          <Link href="/iscrizione">ISCRIVITI</Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="promo-banner">
      <div className="container promo-banner-inner">
        <div className="promo-banner-copy">
          <span>OFFERTA ISCRIZIONE</span>
          <strong>
            Iscriviti entro il 10 agosto a soli {EARLY_BIRD_PRICE_EUR} €
          </strong>
          <small>
            Dopo il 10 agosto la quota sarà di {STANDARD_PRICE_EUR} €
          </small>
        </div>
        <PromoCountdown standardPriceStart={STANDARD_PRICE_START} />
        <Link href="/iscrizione">ISCRIVITI ORA</Link>
      </div>
    </aside>
  );
}

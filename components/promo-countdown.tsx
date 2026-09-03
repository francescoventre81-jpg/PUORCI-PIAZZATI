"use client";

import { useEffect, useState } from "react";
import {
  getCountdownValue,
  type CountdownValue,
} from "@/lib/countdown";

export function PromoCountdown({
  standardPriceStart,
}: {
  standardPriceStart: string;
}) {
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const target = new Date(standardPriceStart).getTime();
    const update = () => setValue(getCountdownValue(Date.now(), target));

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [standardPriceStart]);

  if (!value) {
    return (
      <div
        className="promo-countdown placeholder"
        aria-label="Countdown in caricamento"
      >
        <CountdownUnit label="Giorni" value="--" />
        <CountdownUnit label="Ore" value="--" />
        <CountdownUnit label="Minuti" value="--" />
        <CountdownUnit label="Secondi" value="--" />
      </div>
    );
  }

  if (value.expired) return null;

  return (
    <div
      className="promo-countdown"
      aria-label={`${value.days} giorni, ${value.hours} ore, ${value.minutes} minuti e ${value.seconds} secondi alla fine dell'offerta`}
      aria-live="off"
    >
      <CountdownUnit label="Giorni" value={pad(value.days)} />
      <CountdownUnit label="Ore" value={pad(value.hours)} />
      <CountdownUnit label="Minuti" value={pad(value.minutes)} />
      <CountdownUnit label="Secondi" value={pad(value.seconds)} />
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: string }) {
  return (
    <span className="countdown-unit" aria-hidden="true">
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

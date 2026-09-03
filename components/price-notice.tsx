import { getRegistrationPrice, STANDARD_PRICE_EUR } from "@/lib/pricing";

export function PriceNotice({ compact = false }: { compact?: boolean }) {
  const price = getRegistrationPrice();

  return (
    <div className={`price-notice ${compact ? "compact" : ""}`}>
      {price.tier === "early_bird" ? (
        <>
          <strong>Quota promozionale: {price.amountEur} €</strong>
          <span>fino al 10 agosto 2026</span>
          <del>Quota standard: {STANDARD_PRICE_EUR} €</del>
        </>
      ) : (
        <strong>Quota di iscrizione: {price.amountEur} €</strong>
      )}
    </div>
  );
}

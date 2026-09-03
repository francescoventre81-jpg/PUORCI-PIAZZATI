import {
  CURRENCY,
  EARLY_BIRD_PRICE_EUR,
  STANDARD_PRICE_EUR,
  STANDARD_PRICE_START,
  type RegistrationPrice,
} from "./pricing-config.ts";

export * from "./pricing-config.ts";

/**
 * Fonte applicativa unica della quota corrente.
 *
 * La scadenza indicata (10 agosto, 23:59:59) è ancora promozionale.
 * La quota standard parte esattamente a mezzanotte dell'11 agosto a Roma.
 * In produzione questa funzione viene invocata esclusivamente sul server.
 */
export function getRegistrationPrice(now = new Date()): RegistrationPrice {
  const standardStartsAt = new Date(STANDARD_PRICE_START).getTime();
  const isEarlyBird = now.getTime() < standardStartsAt;
  const amountEur = isEarlyBird
    ? EARLY_BIRD_PRICE_EUR
    : STANDARD_PRICE_EUR;

  return {
    amountCents: amountEur * 100,
    amountEur,
    currency: CURRENCY,
    tier: isEarlyBird ? "early_bird" : "standard",
    calculatedAt: now.toISOString(),
  };
}

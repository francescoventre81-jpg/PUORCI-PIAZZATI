export const EARLY_BIRD_PRICE_EUR = 35;
export const STANDARD_PRICE_EUR = 40;
export const EARLY_BIRD_DEADLINE = "2026-08-10T23:59:59+02:00";
export const STANDARD_PRICE_START = "2026-08-11T00:00:00+02:00";
export const TIME_ZONE = "Europe/Rome";
export const CURRENCY = "EUR";

export type PricingTier = "early_bird" | "standard";

export type RegistrationPrice = {
  amountCents: number;
  amountEur: number;
  currency: typeof CURRENCY;
  tier: PricingTier;
  calculatedAt: string;
};

export function formatPrice(amountCents: number) {
  return `${Math.trunc(amountCents / 100)} €`;
}

export function paypalAmount(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

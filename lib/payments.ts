export {
  CURRENCY as REGISTRATION_CURRENCY,
  formatPrice,
  getRegistrationPrice,
  paypalAmount,
} from "@/lib/pricing";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createShortCode(prefix: string, length = 7) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const value = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join(
    "",
  );
  return `${prefix}${value}`;
}

export function getBankConfiguration() {
  const accountHolder = process.env.BANK_ACCOUNT_HOLDER?.trim();
  const iban = process.env.BANK_IBAN?.replace(/\s+/g, "").toUpperCase();

  if (!accountHolder || !iban) {
    throw new Error("Dati bancari non configurati.");
  }

  return { accountHolder, iban };
}

export type PaymentMethod = "paypal" | "instant_bank_transfer" | "cash";

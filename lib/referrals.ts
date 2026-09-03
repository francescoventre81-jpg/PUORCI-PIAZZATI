export const REFERRAL_CODE_PATTERN = /^FP-[A-Z0-9]{6}$/;

export function normalizeReferralCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isReferralCodeFormatValid(value: string) {
  return REFERRAL_CODE_PATTERN.test(value);
}

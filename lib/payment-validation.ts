type PayPalOrderForValidation = {
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
};

export function isPayPalPaymentValid(
  order: PayPalOrderForValidation,
  registrationId: string,
  amountDueCents: number,
  currency = "EUR",
) {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return (
    order.status === "COMPLETED" &&
    unit?.custom_id === registrationId &&
    capture?.status === "COMPLETED" &&
    capture.amount?.currency_code === currency &&
    capture.amount?.value === (amountDueCents / 100).toFixed(2)
  );
}

export function isPaymentSufficient(
  amountDueCents: number,
  amountPaidCents: number,
) {
  return (
    Number.isInteger(amountDueCents) &&
    Number.isInteger(amountPaidCents) &&
    amountPaidCents >= amountDueCents
  );
}

export function formatCurrency(
  amountInCents: number,
  locale: string = "es-ES",
  currency: string = "EUR",
): string {
  const amount = amountInCents / 100;

  return amount.toLocaleString(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  });
}

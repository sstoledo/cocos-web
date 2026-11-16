// Integer-cents helpers. All money math goes through string-to-cents
// conversion; no float arithmetic is allowed (WOF-F6).
export function toCents(value: string): number {
  const trimmed = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`Invalid decimal amount: ${value}`);
  }

  const [whole, frac = ''] = trimmed.split('.');
  const fracCents = Number.parseInt(frac.padEnd(2, '0') || '0', 10);

  return Number.parseInt(whole, 10) * 100 + fracCents;
}

export function formatCents(cents: number): string {
  const whole = Math.floor(cents / 100);
  const frac = cents % 100;

  return `${whole}.${frac.toString().padStart(2, '0')}`;
}

/** Shared money display: soles with the S/ prefix. Every read-only
 * money column (tables, detail pages, sections) renders through this so
 * the currency sign and decimal format live in one place. */
const MONEY_FORMAT = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

export function formatMoney(value: string | number): string {
  // Number() here is display-only conversion of an already-validated
  // decimal string; all money math stays in cents (WOF-F6).
  // Intl renders the currency separator as U+00A0; normalize it so the
  // output is a plain space everywhere.
  return MONEY_FORMAT.format(Number(value)).replace(/\u00A0/g, ' ');
}

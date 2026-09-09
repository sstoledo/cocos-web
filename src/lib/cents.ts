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

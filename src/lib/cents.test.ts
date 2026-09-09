import { describe, expect, it } from 'vitest';
import { formatCents, toCents } from './cents';

describe('toCents', () => {
  it('converts whole amounts', () => {
    expect(toCents('150')).toBe(15000);
  });

  it('converts 2dp amounts', () => {
    expect(toCents('19.99')).toBe(1999);
  });

  it('pads 1dp amounts', () => {
    expect(toCents('0.1')).toBe(10);
  });

  it('converts zero', () => {
    expect(toCents('0.00')).toBe(0);
  });

  it('throws on more than 2 decimal places', () => {
    expect(() => toCents('1.234')).toThrow('Invalid decimal amount');
  });

  it('throws on empty input', () => {
    expect(() => toCents('')).toThrow('Invalid decimal amount');
  });

  it('throws on non-numeric input', () => {
    expect(() => toCents('abc')).toThrow('Invalid decimal amount');
  });

  it('throws on negative input', () => {
    expect(() => toCents('-5.00')).toThrow('Invalid decimal amount');
  });
});

describe('formatCents', () => {
  it('formats with fixed 2 decimals', () => {
    expect(formatCents(2029)).toBe('20.29');
  });

  it('pads single-digit cents', () => {
    expect(formatCents(2005)).toBe('20.05');
  });

  it('formats zero', () => {
    expect(formatCents(0)).toBe('0.00');
  });
});

describe('integer-cents arithmetic (S10)', () => {
  it('0.10 x 3 + 19.99 equals 20.29 exactly', () => {
    const total = toCents('0.10') * 3 + toCents('19.99');

    expect(total).toBe(2029);
    expect(formatCents(total)).toBe('20.29');
  });

  it('19.99 x 3 has no float drift', () => {
    const total = toCents('19.99') * 3;

    expect(total).toBe(5997);
    expect(formatCents(total)).toBe('59.97');
  });

  it('0.1 + 0.2 equals 0.30 exactly', () => {
    expect(formatCents(toCents('0.1') + toCents('0.2'))).toBe('0.30');
  });
});

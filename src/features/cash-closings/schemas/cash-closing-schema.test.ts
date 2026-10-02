import { describe, expect, it } from 'vitest';
import { closeCashClosingSchema } from './cash-closing-schema';

describe('closeCashClosingSchema', () => {
  it('accepts a valid decimal string with notes', () => {
    const result = closeCashClosingSchema.safeParse({
      declaredCash: '1250.00',
      notes: 'Todo en orden',
    });

    expect(result.success).toBe(true);
  });

  it('accepts an integer string without decimals', () => {
    const result = closeCashClosingSchema.safeParse({ declaredCash: '1250' });

    expect(result.success).toBe(true);
  });

  it('allows notes to be omitted', () => {
    const result = closeCashClosingSchema.safeParse({
      declaredCash: '1250.00',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a negative amount', () => {
    const result = closeCashClosingSchema.safeParse({ declaredCash: '-10' });

    expect(result.success).toBe(false);
  });

  it('rejects more than 2 decimals', () => {
    const result = closeCashClosingSchema.safeParse({
      declaredCash: '10.123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects non-numeric input', () => {
    const result = closeCashClosingSchema.safeParse({ declaredCash: 'abc' });

    expect(result.success).toBe(false);
  });

  it('rejects an empty declaredCash', () => {
    const result = closeCashClosingSchema.safeParse({ declaredCash: '' });

    expect(result.success).toBe(false);
  });
});

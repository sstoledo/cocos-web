import { describe, expect, it } from 'vitest';
import { isValidRuc } from './ruc';

describe('isValidRuc', () => {
  it('accepts an 11-digit RUC with a valid check digit', () => {
    expect(isValidRuc('20100070970')).toBe(true);
    expect(isValidRuc('10456789019')).toBe(true);
  });

  it('rejects an 11-digit RUC whose check digit is invalid', () => {
    expect(isValidRuc('20100070971')).toBe(false);
    expect(isValidRuc('12345678901')).toBe(false);
  });

  it('rejects an 11-digit RUC with an invalid entity prefix', () => {
    expect(isValidRuc('99123456789')).toBe(false);
  });

  it('rejects values with fewer or more than 11 digits', () => {
    expect(isValidRuc('2010007097')).toBe(false);
    expect(isValidRuc('201000709700')).toBe(false);
  });

  it('rejects values with non-digit characters', () => {
    expect(isValidRuc('2010007097a')).toBe(false);
  });
});

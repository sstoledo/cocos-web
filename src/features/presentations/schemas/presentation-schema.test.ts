import { describe, expect, it } from 'vitest';
import { presentationSchema } from './presentation-schema';

const validValues = {
  name: 'Presentación Ejemplo',
};

describe('presentationSchema', () => {
  it('accepts valid values', () => {
    expect(presentationSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts minimal values', () => {
    const result = presentationSchema.safeParse({
      name: 'Presentación Mínima',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = presentationSchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = presentationSchema.safeParse({
      ...validValues,
      name: 'a'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty optional fields', () => {
    const result = presentationSchema.safeParse({
      name: 'Presentación Mínima',
    });

    expect(result.success).toBe(true);
  });
});

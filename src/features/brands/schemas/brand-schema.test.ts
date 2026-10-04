import { describe, expect, it } from 'vitest';
import { brandSchema } from './brand-schema';

const validValues = {
  name: 'Marca Ejemplo',
};

describe('brandSchema', () => {
  it('accepts valid values', () => {
    expect(brandSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts minimal values', () => {
    const result = brandSchema.safeParse({
      name: 'Marca Mínima',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = brandSchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = brandSchema.safeParse({
      ...validValues,
      name: 'a'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty optional fields', () => {
    const result = brandSchema.safeParse({
      name: 'Marca Mínima',
    });

    expect(result.success).toBe(true);
  });
});

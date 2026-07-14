import { describe, expect, it } from 'vitest';
import { clientSchema } from './client-schema';

const validValues = {
  name: 'Juan Pérez',
  identificationType: 'DNI' as const,
  identification: '12345678',
  phone: '999888777',
  email: 'juan@example.com',
  address: 'Av. Principal 123',
};

describe('clientSchema', () => {
  it('accepts valid DNI values', () => {
    expect(clientSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts valid RUC values', () => {
    const result = clientSchema.safeParse({
      ...validValues,
      identificationType: 'RUC',
      identification: '12345678901',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = clientSchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an RUC with DNI length', () => {
    const result = clientSchema.safeParse({
      ...validValues,
      identificationType: 'RUC',
      identification: '12345678',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid identification length', () => {
    const result = clientSchema.safeParse({
      ...validValues,
      identification: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = clientSchema.safeParse({
      ...validValues,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('accepts optional phone and address', () => {
    const result = clientSchema.safeParse({
      name: 'Juan Pérez',
      identificationType: 'DNI',
      identification: '12345678',
    });

    expect(result.success).toBe(true);
  });
});

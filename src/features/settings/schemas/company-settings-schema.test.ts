import { describe, expect, it } from 'vitest';
import { companySettingsSchema } from './company-settings-schema';

const validValues = {
  ruc: '20100070970',
  legalName: 'Cocos SAC',
  address: 'Av. Principal 123',
  facturaSeries: 'F001',
  boletaSeries: 'B001',
};

describe('companySettingsSchema', () => {
  it('accepts valid issuer settings', () => {
    expect(companySettingsSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejects an invalid RUC check digit', () => {
    const result = companySettingsSchema.safeParse({
      ...validValues,
      ruc: '12345678901',
    });

    expect(result.success).toBe(false);
  });

  it('accepts an empty RUC while it is not configured yet', () => {
    const result = companySettingsSchema.safeParse({
      ...validValues,
      ruc: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing legal name', () => {
    const result = companySettingsSchema.safeParse({
      ...validValues,
      legalName: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty series value', () => {
    const result = companySettingsSchema.safeParse({
      ...validValues,
      boletaSeries: '',
    });

    expect(result.success).toBe(false);
  });
});

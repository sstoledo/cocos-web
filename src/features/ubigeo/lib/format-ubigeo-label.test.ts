import { describe, expect, it } from 'vitest';
import { formatUbigeoLabel } from './format-ubigeo-label';

describe('formatUbigeoLabel', () => {
  it('shows district, province, department and the code', () => {
    expect(
      formatUbigeoLabel({
        code: '250101',
        department: 'Ucayali',
        province: 'Coronel Portillo',
        district: 'Calleria',
      })
    ).toBe('Calleria, Coronel Portillo, Ucayali (250101)');
  });
});

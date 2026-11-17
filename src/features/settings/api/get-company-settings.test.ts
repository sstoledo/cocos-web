import { describe, expect, it, vi } from 'vitest';
import { getCompanySettings } from './get-company-settings';

const mockSettings = {
  id: 'settings-1',
  ruc: '20100070970',
  legalName: 'Cocos SAC',
  address: 'Av. Principal 123',
  facturaSeries: 'F001',
  boletaSeries: 'B001',
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
};

describe('getCompanySettings', () => {
  it('fetches the company settings with credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });
    globalThis.fetch = fetchMock;

    const result = await getCompanySettings();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/settings/company',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockSettings);
  });

  it('throws when the response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });

    await expect(getCompanySettings()).rejects.toThrow(
      'Failed to fetch company settings: 403'
    );
  });
});

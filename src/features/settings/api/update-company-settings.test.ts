import { describe, expect, it, vi } from 'vitest';
import { updateCompanySettings } from './update-company-settings';

const mockSettings = {
  id: 'settings-1',
  ruc: '20100070970',
  legalName: 'Cocos SAC',
  address: null,
  facturaSeries: 'F001',
  boletaSeries: 'B001',
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
};

describe('updateCompanySettings', () => {
  it('patches the company settings with the provided values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });
    globalThis.fetch = fetchMock;

    const result = await updateCompanySettings({ ruc: '20100070970' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/settings/company',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc: '20100070970' }),
      }
    );
    expect(result).toEqual(mockSettings);
  });

  it('throws when the response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });

    await expect(updateCompanySettings({})).rejects.toThrow(
      'Failed to update company settings: 400'
    );
  });
});

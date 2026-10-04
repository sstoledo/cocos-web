import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand, BrandFormValues } from '../types';
import { updateBrand } from './update-brand';

const mockBrand: Brand = {
  id: 'b1',
  name: 'Marca Actualizada',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const updateValues: Partial<BrandFormValues> = {
  name: 'Marca Actualizada',
};

describe('updateBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a brand', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrand,
    });

    const result = await updateBrand('b1', updateValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands/b1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateValues),
      }
    );
    expect(result).toEqual(mockBrand);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(updateBrand('b1', updateValues)).rejects.toThrow(
      'Failed to update brand: 400'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand, BrandFormValues } from '../types';
import { createBrand } from './create-brand';

const mockBrand: Brand = {
  id: 'b1',
  name: 'Marca Nueva',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const validValues: BrandFormValues = {
  name: 'Marca Nueva',
};

describe('createBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a brand', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrand,
    });

    const result = await createBrand(validValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validValues),
      }
    );
    expect(result).toEqual(mockBrand);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(createBrand(validValues)).rejects.toThrow(
      'Failed to create brand: 400'
    );
  });
});

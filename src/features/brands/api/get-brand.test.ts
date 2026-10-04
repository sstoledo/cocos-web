import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand } from '../types';
import { getBrand } from './get-brand';

const mockBrand: Brand = {
  id: 'b1',
  name: 'Marca 1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches brand by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrand,
    });

    const result = await getBrand('b1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands/b1',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockBrand);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getBrand('b1')).rejects.toThrow('Failed to fetch brand: 404');
  });
});

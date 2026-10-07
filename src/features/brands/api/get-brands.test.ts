import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand, BrandListFilters } from '../types';
import { getBrands } from './get-brands';

const mockBrands: Brand[] = [
  {
    id: 'b1',
    name: 'Marca 1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'b2',
    name: 'Marca 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('getBrands', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches brands without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });

    const result = await getBrands({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockBrands);
  });

  it('fetches brands with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });

    const filters: BrandListFilters = { q: 'Marca' };
    await getBrands(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands?q=Marca',
      { credentials: 'include' }
    );
  });

  it('fetches brands with pagination', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });

    const filters: BrandListFilters = { q: 'Marca', page: 2, limit: 25 };
    await getBrands(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands?q=Marca&page=2&limit=25',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getBrands({})).rejects.toThrow('Failed to fetch brands: 500');
  });
});

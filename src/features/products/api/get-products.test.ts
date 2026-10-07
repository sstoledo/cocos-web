import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductListResponse } from '../types';
import { getProducts } from './get-products';

const mockResponse: ProductListResponse = {
  data: [
    {
      id: 'p1',
      code: 'COD-001',
      name: 'Aceite 20W50',
      price: '25.00',
      isActive: true,
      presentation: { id: 'pres1', name: 'Litro' },
      brand: { id: 'brand1', name: 'Castrol' },
      category: { id: 'cat1', name: 'Lubricantes' },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('getProducts', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches products without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getProducts({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockResponse);
  });

  it('fetches products with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await getProducts({ q: 'aceite' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?q=aceite',
      { credentials: 'include' }
    );
  });

  it('fetches products with isActive filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await getProducts({ isActive: false });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?isActive=false',
      { credentials: 'include' }
    );
  });

  it('fetches products with pagination', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await getProducts({ q: 'aceite', isActive: true, page: 2, limit: 25 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?q=aceite&isActive=true&page=2&limit=25',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getProducts({})).rejects.toThrow(
      'Failed to fetch products: 500'
    );
  });
});

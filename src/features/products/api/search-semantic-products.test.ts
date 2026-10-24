import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import {
  isEmbeddingsNotConfiguredError,
  searchSemanticProducts,
} from './search-semantic-products';

const mockResponse: { data: Product[] } = {
  data: [
    {
      id: 'p1',
      code: 'OIL-001',
      name: 'Aceite sintético 5W-30',
      price: '30.00',
      isActive: true,
      presentation: { id: 'pres1', name: 'Litro' },
      brand: { id: 'brand1', name: 'Castrol' },
      category: { id: 'cat1', name: 'Lubricantes' },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
};

describe('searchSemanticProducts', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches semantic matches with the exact query parameters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await searchSemanticProducts({
      q: 'aceite sintético',
      limit: 20,
      isActive: true,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products/search/semantic?q=aceite+sint%C3%A9tico&limit=20&isActive=true',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockResponse);
  });

  it('omits optional filters when they are not provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await searchSemanticProducts({ q: 'aceite' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products/search/semantic?q=aceite',
      { credentials: 'include' }
    );
  });

  it('exposes the embeddings-not-configured error for cautious fallback', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        message: 'Embeddings are not configured',
        errorCode: 'EMBEDDINGS_NOT_CONFIGURED',
      }),
    });

    const error = await searchSemanticProducts({ q: 'aceite' }).catch(
      (caught: unknown) => caught
    );

    expect(error).toMatchObject({
      status: 503,
      errorCode: 'EMBEDDINGS_NOT_CONFIGURED',
    });
    expect(isEmbeddingsNotConfiguredError(error)).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category } from '../types';
import { getCategory } from './get-category';

const mockCategory: Category = {
  id: 'c1',
  name: 'Categoría 1',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches category by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategory,
    });

    const result = await getCategory('c1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories/c1',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockCategory);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getCategory('c1')).rejects.toThrow(
      'Failed to fetch category: 404'
    );
  });
});

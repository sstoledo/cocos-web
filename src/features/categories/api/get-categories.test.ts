import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, CategoryListFilters } from '../types';
import { getCategories } from './get-categories';

const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Categoría 1',
    parentId: null,
    parent: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'Categoría 2',
    parentId: 'c1',
    parent: {
      id: 'c1',
      name: 'Categoría 1',
      parentId: null,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('getCategories', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches categories without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    const result = await getCategories({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockCategories);
  });

  it('fetches categories with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    const filters: CategoryListFilters = { q: 'Categoría' };
    await getCategories(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories?q=Categor%C3%ADa',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getCategories({})).rejects.toThrow(
      'Failed to fetch categories: 500'
    );
  });
});

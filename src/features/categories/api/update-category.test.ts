import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, CategoryFormValues } from '../types';
import { updateCategory } from './update-category';

const mockCategory: Category = {
  id: 'c1',
  name: 'Categoría Actualizada',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const updateValues: Partial<CategoryFormValues> = {
  name: 'Categoría Actualizada',
};

describe('updateCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a category', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategory,
    });

    const result = await updateCategory('c1', updateValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories/c1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateValues),
      }
    );
    expect(result).toEqual(mockCategory);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(updateCategory('c1', updateValues)).rejects.toThrow(
      'Failed to update category: 400'
    );
  });
});

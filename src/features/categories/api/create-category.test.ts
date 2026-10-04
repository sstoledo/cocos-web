import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, CategoryFormValues } from '../types';
import { createCategory } from './create-category';

const mockCategory: Category = {
  id: 'c1',
  name: 'Categoría Nueva',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const validValues: CategoryFormValues = {
  name: 'Categoría Nueva',
  parentId: null,
};

describe('createCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a category', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategory,
    });

    const result = await createCategory(validValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validValues),
      }
    );
    expect(result).toEqual(mockCategory);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(createCategory(validValues)).rejects.toThrow(
      'Failed to create category: 400'
    );
  });
});

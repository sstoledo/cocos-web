import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteCategory } from './delete-category';

describe('deleteCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a category', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    await deleteCategory('c1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories/c1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deleteCategory('c1')).rejects.toThrow(
      'Failed to delete category: 404'
    );
  });
});

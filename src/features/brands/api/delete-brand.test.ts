import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteBrand } from './delete-brand';

describe('deleteBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a brand', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    await deleteBrand('b1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands/b1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deleteBrand('b1')).rejects.toThrow(
      'Failed to delete brand: 404'
    );
  });
});

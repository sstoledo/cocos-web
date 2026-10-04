import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteSupplier } from './delete-supplier';

describe('deleteSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a supplier', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await deleteSupplier('s1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers/s1',
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deleteSupplier('s1')).rejects.toThrow(
      'Failed to delete supplier: 404'
    );
  });
});

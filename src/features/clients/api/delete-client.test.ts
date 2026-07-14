import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteClient } from './delete-client';

describe('deleteClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a client by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await deleteClient('c1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients/c1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      })
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deleteClient('c1')).rejects.toThrow(
      'Failed to delete client: 404'
    );
  });
});

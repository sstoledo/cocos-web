import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deletePresentation } from './delete-presentation';

describe('deletePresentation', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a presentation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    await deletePresentation('p1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations/p1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deletePresentation('p1')).rejects.toThrow(
      'Failed to delete presentation: 404'
    );
  });
});

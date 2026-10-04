import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Presentation } from '../types';
import { getPresentation } from './get-presentation';

const mockPresentation: Presentation = {
  id: 'p1',
  name: 'Presentación 1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getPresentation', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches presentation by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentation,
    });

    const result = await getPresentation('p1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations/p1',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockPresentation);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getPresentation('p1')).rejects.toThrow(
      'Failed to fetch presentation: 404'
    );
  });
});

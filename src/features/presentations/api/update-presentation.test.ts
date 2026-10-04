import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Presentation, PresentationFormValues } from '../types';
import { updatePresentation } from './update-presentation';

const mockPresentation: Presentation = {
  id: 'p1',
  name: 'Presentación Actualizada',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const updateValues: Partial<PresentationFormValues> = {
  name: 'Presentación Actualizada',
};

describe('updatePresentation', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a presentation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentation,
    });

    const result = await updatePresentation('p1', updateValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations/p1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateValues),
      }
    );
    expect(result).toEqual(mockPresentation);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(updatePresentation('p1', updateValues)).rejects.toThrow(
      'Failed to update presentation: 400'
    );
  });
});

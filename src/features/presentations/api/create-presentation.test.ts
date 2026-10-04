import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Presentation, PresentationFormValues } from '../types';
import { createPresentation } from './create-presentation';

const mockPresentation: Presentation = {
  id: 'p1',
  name: 'Presentación Nueva',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const validValues: PresentationFormValues = {
  name: 'Presentación Nueva',
};

describe('createPresentation', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a presentation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentation,
    });

    const result = await createPresentation(validValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validValues),
      }
    );
    expect(result).toEqual(mockPresentation);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(createPresentation(validValues)).rejects.toThrow(
      'Failed to create presentation: 400'
    );
  });
});

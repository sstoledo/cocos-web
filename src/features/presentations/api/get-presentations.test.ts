import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Presentation, PresentationListFilters } from '../types';
import { getPresentations } from './get-presentations';

const mockPresentations: Presentation[] = [
  {
    id: 'p1',
    name: 'Presentación 1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Presentación 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('getPresentations', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches presentations without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });

    const result = await getPresentations({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockPresentations);
  });

  it('fetches presentations with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });

    const filters: PresentationListFilters = { q: 'Presentación' };
    await getPresentations(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations?q=Presentaci%C3%B3n',
      { credentials: 'include' }
    );
  });

  it('fetches presentations with pagination', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });

    const filters: PresentationListFilters = {
      q: 'Presentación',
      page: 4,
      limit: 50,
    };
    await getPresentations(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations?q=Presentaci%C3%B3n&page=4&limit=50',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getPresentations({})).rejects.toThrow(
      'Failed to fetch presentations: 500'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LotListResponse } from '../types';
import { getLots } from './get-lots';

const mockResponse: LotListResponse = {
  data: [
    {
      id: 'lot-1',
      lotNumber: 'L-2026-001',
      supplier: { id: 's1', name: 'Proveedor A' },
      receivedAt: '2026-07-13T12:00:00.000Z',
      items: [],
    },
  ],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('getLots', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches lots without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getLots({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lots',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockResponse);
  });

  it('fetches lots with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await getLots({ q: 'L-2026' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lots?q=L-2026',
      { credentials: 'include' }
    );
  });

  it('fetches lots with pagination', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await getLots({ q: 'L-2026', page: 2, limit: 5 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lots?q=L-2026&page=2&limit=5',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getLots({})).rejects.toThrow('Failed to fetch lots: 500');
  });
});

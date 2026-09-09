import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import type { SaleListResponse } from '../types';
import { getSales } from './get-sales';

const listResponse: SaleListResponse = {
  data: [buildSale()],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('getSales', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches sales without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const result = await getSales({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales',
      { credentials: 'include' }
    );
    expect(result).toEqual(listResponse);
  });

  it('builds the query string with all filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getSales({
      saleNumber: 'VTA-2026',
      from: '2026-01-01',
      to: '2026-01-31',
      clientId: 'c1',
      status: 'completed',
      page: 2,
      limit: 10,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      // URLSearchParams percent-encodes the `:` in the ISO datetimes.
      'http://localhost:3000/api/sales?saleNumber=VTA-2026&from=2026-01-01T00%3A00%3A00.000&to=2026-01-31T23%3A59%3A59.999&clientId=c1&status=completed&page=2&limit=10',
      { credentials: 'include' }
    );
  });

  it('shifts `from` to the start of the day and `to` to end-of-day', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getSales({ from: '2026-03-15', to: '2026-03-15' });

    const url = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;

    expect(url).toContain('from=2026-03-15T00%3A00%3A00.000');
    expect(url).toContain('to=2026-03-15T23%3A59%3A59.999');
  });

  it('omits empty filters from the query string', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getSales({ saleNumber: '', clientId: '', from: '', to: '' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales',
      { credentials: 'include' }
    );
  });

  it('throws an ApiError with the backend errorCode on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden', errorCode: 'FORBIDDEN' }),
    });

    const error = await getSales({}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(403);
    expect((error as ApiError).errorCode).toBe('FORBIDDEN');
  });

  it('throws an ApiError without errorCode when the body is unreadable', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('no json');
      },
    });

    const error = await getSales({}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).errorCode).toBeUndefined();
  });
});

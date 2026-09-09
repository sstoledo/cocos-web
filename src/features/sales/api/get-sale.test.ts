import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { getSale } from './get-sale';

const sale = buildSale();

describe('getSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a sale by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    const result = await getSale('sale1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales/sale1',
      { credentials: 'include' }
    );
    expect(result).toEqual(sale);
  });

  it('throws an ApiError with status 404 when the sale does not exist', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Sale not found',
        errorCode: 'SALE_NOT_FOUND',
      }),
    });

    const error = await getSale('missing').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).errorCode).toBe('SALE_NOT_FOUND');
  });

  it('exposes the error code for other failures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('no json');
      },
    });

    const error = await getSale('sale1').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).errorCode).toBeUndefined();
  });
});

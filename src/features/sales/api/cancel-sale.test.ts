import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { cancelSale } from './cancel-sale';

const sale = buildSale();

function patchInit() {
  return (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as
    | RequestInit
    | undefined;
}

describe('cancelSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('patches /sales/:id/cancel with credentials, no body and no Content-Type (B9)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    const result = await cancelSale('sale1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales/sale1/cancel',
      {
        method: 'PATCH',
        credentials: 'include',
        body: undefined,
      }
    );
    expect(patchInit()?.body).toBeUndefined();
    expect(patchInit()?.headers).toBeUndefined();
    expect(result).toEqual(sale);
  });

  it.each([
    [409, 'SALE_ALREADY_CANCELLED'],
    [404, 'SALE_NOT_FOUND'],
  ])(
    'throws an ApiError surfacing errorCode on %s',
    async (status, errorCode) => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status,
        json: async () => ({ message: 'error', errorCode }),
      });

      const promise = cancelSale('sale1');

      await expect(promise).rejects.toThrow(`Failed to cancel sale: ${status}`);
      await expect(promise).rejects.toMatchObject({ status, errorCode });
      await expect(promise).rejects.toBeInstanceOf(ApiError);
    }
  );
});

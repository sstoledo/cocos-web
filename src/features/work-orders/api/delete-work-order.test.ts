import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteWorkOrder } from './delete-work-order';

describe('deleteWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends DELETE to /work-orders/:id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

    await deleteWorkOrder('wo-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo-1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('throws an ApiError surfacing errorCode when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Not found',
        errorCode: 'WORK_ORDER_NOT_FOUND',
      }),
    });

    const promise = deleteWorkOrder('wo-1');

    await expect(promise).rejects.toThrow('Failed to delete work order: 404');
    await expect(promise).rejects.toMatchObject({
      status: 404,
      errorCode: 'WORK_ORDER_NOT_FOUND',
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });
});

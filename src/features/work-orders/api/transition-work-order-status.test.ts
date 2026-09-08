import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWorkOrder } from '../test/fixtures';
import { transitionWorkOrderStatus } from './transition-work-order-status';

describe('transitionWorkOrderStatus', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('patches /work-orders/:id/status with the target status', async () => {
    const workOrder = buildWorkOrder({ status: 'in_progress' });
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const result = await transitionWorkOrderStatus('wo1', {
      status: 'in_progress',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1/status',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    expect(JSON.parse(requestInit.body as string)).toEqual({
      status: 'in_progress',
    });
    expect(result).toEqual(workOrder);
  });

  it('throws an ApiError surfacing errorCode and details when the request fails', async () => {
    const details = [{ productId: 'p1', requested: 3, available: 1 }];
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Insufficient stock',
        errorCode: 'INSUFFICIENT_STOCK',
        details,
      }),
    });

    const promise = transitionWorkOrderStatus('wo1', { status: 'done' });

    await expect(promise).rejects.toThrow(
      'Failed to transition work order: 409'
    );
    await expect(promise).rejects.toMatchObject({
      status: 409,
      errorCode: 'INSUFFICIENT_STOCK',
      details,
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });
});

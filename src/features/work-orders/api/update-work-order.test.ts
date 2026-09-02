import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateWorkOrder } from './update-work-order';

const workOrder = { id: 'wo-1', orderNumber: 'OT-0001' };

describe('updateWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('patches /work-orders/:id with both line arrays', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const payload = {
      clientId: 'c1',
      vehicleId: 'v1',
      description: 'Actualizado',
      services: [{ serviceId: 's1', quantity: 3 }],
      products: [{ productId: 'p1', quantity: 1, unitPrice: 80.5 }],
    };

    const result = await updateWorkOrder('wo-1', payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    expect(JSON.parse(requestInit.body as string)).toEqual(payload);
    expect(result).toEqual(workOrder);
  });

  it('omits empty line arrays from the body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    await updateWorkOrder('wo-1', {
      clientId: 'c1',
      vehicleId: 'v1',
      services: [],
      products: [{ productId: 'p1', quantity: 2 }],
    });

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.products).toHaveLength(1);
    expect(body).not.toHaveProperty('services');
  });

  it('throws an ApiError surfacing errorCode when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Empty lines',
        errorCode: 'WORK_ORDER_EMPTY_LINES',
      }),
    });

    const promise = updateWorkOrder('wo-1', {
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 1 }],
    });

    await expect(promise).rejects.toThrow('Failed to update work order: 400');
    await expect(promise).rejects.toMatchObject({
      status: 400,
      errorCode: 'WORK_ORDER_EMPTY_LINES',
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });
});

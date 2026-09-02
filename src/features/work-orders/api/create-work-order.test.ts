import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorkOrder } from './create-work-order';

const workOrder = { id: 'wo-1', orderNumber: 'OT-0001' };

describe('createWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('posts to /work-orders with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const payload = {
      clientId: 'c1',
      vehicleId: 'v1',
      description: 'Cambio de aceite',
      services: [{ serviceId: 's1', quantity: 2, unitPrice: 150 }],
      products: [{ productId: 'p1', quantity: 1 }],
    };

    const result = await createWorkOrder(payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders',
      expect.objectContaining({
        method: 'POST',
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

    await createWorkOrder({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 1 }],
      products: [],
    });

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.services).toHaveLength(1);
    expect(body).not.toHaveProperty('products');
  });

  it('throws an ApiError surfacing errorCode when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Mismatch',
        errorCode: 'VEHICLE_CLIENT_MISMATCH',
      }),
    });

    const promise = createWorkOrder({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 1 }],
    });

    await expect(promise).rejects.toThrow('Failed to create work order: 409');
    await expect(promise).rejects.toMatchObject({
      status: 409,
      errorCode: 'VEHICLE_CLIENT_MISMATCH',
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });
});

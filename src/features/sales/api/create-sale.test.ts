import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { createSale } from './create-sale';

const sale = buildSale();

function postedBody() {
  const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
    .calls[0][1] as RequestInit;
  return JSON.parse(requestInit.body as string);
}

describe('createSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('posts to /sales with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    const result = await createSale({
      clientId: 'c1',
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 2 }],
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(sale);
  });

  it('sends both line arrays verbatim', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    await createSale({
      paymentMethod: 'card',
      productLines: [{ productId: 'p1', quantity: 2 }],
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(postedBody()).toEqual({
      paymentMethod: 'card',
      productLines: [{ productId: 'p1', quantity: 2 }],
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });
  });

  it('always sends both line arrays, even when empty (D7)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    await createSale({
      paymentMethod: 'cash',
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });

    const body = postedBody();
    expect(body.productLines).toEqual([]);
    expect(body.serviceLines).toEqual([{ serviceId: 's1', quantity: 1 }]);
  });

  it('omits clientId, branchId and employeeId when not provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    await createSale({
      paymentMethod: 'transfer',
      productLines: [{ productId: 'p1', quantity: 1 }],
    });

    const body = postedBody();
    expect(body).not.toHaveProperty('clientId');
    expect(body).not.toHaveProperty('branchId');
    expect(body).not.toHaveProperty('employeeId');
  });

  it('omits an empty-string clientId (walk-in sale, SL-F5)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    await createSale({
      clientId: '',
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 1 }],
    });

    expect(postedBody()).not.toHaveProperty('clientId');
  });

  it('sends branchId and employeeId when provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    await createSale({
      clientId: 'c1',
      branchId: 'b1',
      employeeId: 'e1',
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 1 }],
    });

    expect(postedBody()).toMatchObject({
      clientId: 'c1',
      branchId: 'b1',
      employeeId: 'e1',
    });
  });

  it('throws an ApiError surfacing errorCode when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Insufficient stock',
        errorCode: 'INSUFFICIENT_STOCK',
        details: [{ productId: 'p1', requested: 3, available: 1 }],
      }),
    });

    const promise = createSale({
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 3 }],
    });

    await expect(promise).rejects.toThrow('Failed to create sale: 409');
    await expect(promise).rejects.toMatchObject({
      status: 409,
      errorCode: 'INSUFFICIENT_STOCK',
      details: [{ productId: 'p1', requested: 3, available: 1 }],
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });
});

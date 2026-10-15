import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrderPayment } from '../types';
import { getWorkOrderPayments } from './get-work-order-payments';

const payment: WorkOrderPayment = {
  id: 'p1',
  workOrderId: 'wo1',
  amount: '100.00',
  paymentMethod: 'cash',
  note: null,
  paidAt: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

describe('getWorkOrderPayments', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the payments of a work order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [payment],
    });

    const result = await getWorkOrderPayments('wo1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1/payments',
      { credentials: 'include' }
    );
    expect(result).toEqual([payment]);
  });

  it('throws an ApiError when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Not found',
        errorCode: 'WORK_ORDER_NOT_FOUND',
      }),
    });

    await expect(getWorkOrderPayments('wo1')).rejects.toMatchObject({
      status: 404,
      errorCode: 'WORK_ORDER_NOT_FOUND',
    });
  });
});

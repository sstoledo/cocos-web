import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrderPayment } from '../types';
import { createWorkOrderPayment } from './create-work-order-payment';

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

describe('createWorkOrderPayment', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('posts the payment with amount as a number and returns it', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => payment,
    });

    const result = await createWorkOrderPayment('wo1', {
      amount: '100.00',
      paymentMethod: 'cash',
      note: '  Seña  ',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1/payments',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          amount: 100,
          paymentMethod: 'cash',
          note: 'Seña',
        }),
      })
    );
    expect(result).toEqual(payment);
  });

  it('omits the note when it is empty after trimming', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => payment,
    });

    await createWorkOrderPayment('wo1', {
      amount: '100.00',
      paymentMethod: 'card',
      note: '   ',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ amount: 100, paymentMethod: 'card' }),
      })
    );
  });

  it('preserves the server message on WORK_ORDER_OVERPAYMENT', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Payment exceeds remaining balance 150.00',
        errorCode: 'WORK_ORDER_OVERPAYMENT',
      }),
    });

    await expect(
      createWorkOrderPayment('wo1', { amount: '200.00', paymentMethod: 'cash' })
    ).rejects.toMatchObject({
      status: 400,
      errorCode: 'WORK_ORDER_OVERPAYMENT',
      message: 'Payment exceeds remaining balance 150.00',
    });
  });

  it('throws an ApiError on 409 cancelled work order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Work order is cancelled',
        errorCode: 'WORK_ORDER_CANCELLED',
      }),
    });

    await expect(
      createWorkOrderPayment('wo1', { amount: '10.00', paymentMethod: 'cash' })
    ).rejects.toMatchObject({
      status: 409,
      errorCode: 'WORK_ORDER_CANCELLED',
    });
  });
});

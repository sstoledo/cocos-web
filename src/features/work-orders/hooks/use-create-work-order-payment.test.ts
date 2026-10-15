import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrderPayment } from '../types';
import { useCreateWorkOrderPayment } from './use-create-work-order-payment';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

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

describe('useCreateWorkOrderPayment', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates the payment and invalidates the order, its payments and the list', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => payment,
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useCreateWorkOrderPayment(), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      workOrderId: 'wo1',
      payload: { amount: '100.00', paymentMethod: 'cash' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['work-order', 'wo1'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['work-order-payments', 'wo1'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['work-orders'],
    });
  });

  it('surfaces the overpayment error without invalidating', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Payment exceeds remaining balance 150.00',
        errorCode: 'WORK_ORDER_OVERPAYMENT',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useCreateWorkOrderPayment(), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      workOrderId: 'wo1',
      payload: { amount: '200.00', paymentMethod: 'cash' },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      status: 400,
      errorCode: 'WORK_ORDER_OVERPAYMENT',
    });
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

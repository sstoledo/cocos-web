import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import { useCancelPurchaseOrder } from './use-cancel-purchase-order';

const purchaseOrder = buildPurchaseOrder({ status: 'cancelled' });

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useCancelPurchaseOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('cancels the order and invalidates list prefix and detail', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => purchaseOrder,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelPurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('po1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/purchase-orders/po1/cancel',
      expect.objectContaining({ method: 'PATCH', credentials: 'include' })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-order', 'po1'],
    });
  });

  it('re-invalidates on 409 so the UI resyncs the true state', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Cannot cancel an order with received stock',
        errorCode: 'PO_CANNOT_CANCEL',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelPurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('po1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-order', 'po1'],
    });
  });

  it('does not invalidate on non-409 failures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Purchase order not found',
        errorCode: 'PURCHASE_ORDER_NOT_FOUND',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelPurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('po1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});

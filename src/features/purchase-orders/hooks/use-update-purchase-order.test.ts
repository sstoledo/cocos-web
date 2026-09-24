import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import { useUpdatePurchaseOrder } from './use-update-purchase-order';

const purchaseOrder = buildPurchaseOrder();
const payload = {
  lines: [
    { productId: 'p1', quantityOrdered: 20, estimatedCostPrice: '50.00' },
  ],
};

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

describe('useUpdatePurchaseOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates the purchase order and invalidates list prefix and detail', async () => {
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

    const { result } = renderHook(() => useUpdatePurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'po1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/purchase-orders/po1',
      expect.objectContaining({ method: 'PATCH', credentials: 'include' })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-order', 'po1'],
    });
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Only draft orders can be edited',
        errorCode: 'PURCHASE_ORDER_NOT_DRAFT',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdatePurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'po1', payload });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['purchase-orders'],
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['purchase-order', 'po1'],
    });
  });
});

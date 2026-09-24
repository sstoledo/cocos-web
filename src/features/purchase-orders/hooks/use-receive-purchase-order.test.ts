import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import { useReceivePurchaseOrder } from './use-receive-purchase-order';

const purchaseOrder = buildPurchaseOrder({ status: 'partially_received' });

const payload = {
  lines: [
    {
      lineId: 'line-1',
      receivedQty: 2,
      expirationDate: '2027-01-01',
      actualCostPrice: '10.00',
    },
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

describe('useReceivePurchaseOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('receives stock and invalidates purchase orders, lots and products', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...purchaseOrder, lotIds: ['lot-1'] }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReceivePurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'po1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/purchase-orders/po1/receive',
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['purchase-order', 'po1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['lots'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['products', 'list'],
    });
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Received quantity exceeds ordered quantity',
        errorCode: 'PO_RECEIVE_OVERSHOOT',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReceivePurchaseOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'po1', payload });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});

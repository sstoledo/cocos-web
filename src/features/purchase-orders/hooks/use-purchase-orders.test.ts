import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import type {
  PurchaseOrderListFilters,
  PurchaseOrderListResponse,
} from '../types';
import { usePurchaseOrders } from './use-purchase-orders';

const purchaseOrder = buildPurchaseOrder();

const listResponse: PurchaseOrderListResponse = {
  data: [purchaseOrder],
  meta: { page: 1, limit: 10, total: 25 },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('usePurchaseOrders', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches purchase orders and derives totalPages from meta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const { result } = renderHook(() => usePurchaseOrders({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.purchaseOrders).toEqual([purchaseOrder]);
    expect(result.current.meta).toEqual({ page: 1, total: 25, totalPages: 3 });
    expect(result.current.error).toBeNull();
  });

  it('scopes the query key by filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { filters: PurchaseOrderListFilters }) =>
        usePurchaseOrders(props.filters),
      {
        initialProps: { filters: { status: 'draft', page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { status: 'draft', page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/purchase-orders?status=draft&page=2',
        { credentials: 'include' }
      )
    );
  });
});

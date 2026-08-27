import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrder, WorkOrderListResponse } from '../types';
import { useWorkOrders } from './use-work-orders';

const workOrder: WorkOrder = {
  id: 'wo1',
  orderNumber: 'OC-2026-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
  description: null,
  status: 'pending',
  totalAmount: '15000.00',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  products: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const listResponse: WorkOrderListResponse = {
  data: [workOrder],
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

describe('useWorkOrders', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches work orders and derives totalPages from meta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const { result } = renderHook(() => useWorkOrders({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workOrders).toEqual([workOrder]);
    expect(result.current.meta).toEqual({ page: 1, total: 25, totalPages: 3 });
    expect(result.current.error).toBeNull();
  });

  it('returns empty defaults when there is no data', () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useWorkOrders({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.workOrders).toEqual([]);
    expect(result.current.meta).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('scopes the query key by filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { filters: { query: string; page: number } }) =>
        useWorkOrders(props.filters),
      {
        initialProps: { filters: { query: 'first', page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { query: 'second', page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/work-orders?query=second&page=2',
        { credentials: 'include' }
      )
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useWorkOrders({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

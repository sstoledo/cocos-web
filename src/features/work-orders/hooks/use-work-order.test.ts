import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrder } from '../types';
import { useWorkOrder } from './use-work-order';

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

const workOrder: WorkOrder = {
  id: 'wo1',
  orderNumber: 'OC-2026-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
  description: null,
  status: 'done',
  totalAmount: '15000.00',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  products: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('useWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a work order by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const { result } = renderHook(() => useWorkOrder('wo1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(workOrder);
  });

  it('scopes the query key by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => workOrder,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { id: string }) => useWorkOrder(props.id),
      {
        initialProps: { id: 'wo1' },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ id: 'wo2' });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/work-orders/wo2',
        { credentials: 'include' }
      )
    );
  });

  it('does not fetch when the id is empty', () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    renderHook(() => useWorkOrder(''), {
      wrapper: createWrapper(),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

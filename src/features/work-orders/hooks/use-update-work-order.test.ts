import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUpdateWorkOrder } from './use-update-work-order';

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

const payload = {
  clientId: 'c1',
  vehicleId: 'v1',
  services: [{ serviceId: 's1', quantity: 3 }],
  products: [{ productId: 'p1', quantity: 1 }],
};

describe('useUpdateWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a work order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'wo-1' }),
    });

    const { result } = renderHook(() => useUpdateWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'wo-1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo-1',
      expect.objectContaining({ method: 'PATCH', credentials: 'include' })
    );
    expect(result.current.data).toEqual({ id: 'wo-1' });
  });

  it('exposes the error when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Mismatch',
        errorCode: 'VEHICLE_CLIENT_MISMATCH',
      }),
    });

    const { result } = renderHook(() => useUpdateWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'wo-1', payload });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('invalidates the list and the detail on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'wo-1' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateWorkOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'wo-1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-order', 'wo-1'],
    });
  });
});

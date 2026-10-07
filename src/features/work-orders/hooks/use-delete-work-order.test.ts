import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteWorkOrder } from './use-delete-work-order';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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

describe('useDeleteWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('deletes a work order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useDeleteWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('wo-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo-1',
      { method: 'DELETE', credentials: 'include' }
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Orden de trabajo eliminada correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('exposes the error when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    });

    const { result } = renderHook(() => useDeleteWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('wo-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la orden de trabajo'
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('invalidates the work orders list on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteWorkOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('wo-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-orders'],
    });
  });
});

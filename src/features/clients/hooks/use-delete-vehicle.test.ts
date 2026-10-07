import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteVehicle } from './use-delete-vehicle';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useDeleteVehicle', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('deletes a vehicle and invalidates the client and vehicle queries', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useDeleteVehicle(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'v1', clientId: 'c1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['client', 'c1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['vehicles', 'c1'],
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Vehículo eliminado correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDeleteVehicle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'v1', clientId: 'c1' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar el vehículo');
    expect(toast.success).not.toHaveBeenCalled();
  });
});

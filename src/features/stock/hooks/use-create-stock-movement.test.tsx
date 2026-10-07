import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateStockMovement } from './use-create-stock-movement';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateStockMovement', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('creates a stock movement and shows a success toast', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useCreateStockMovement('p1'), {
      wrapper,
    });

    result.current.mutate({ quantity: 5, reason: 'Conteo físico' });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(toast.success).toHaveBeenCalledWith(
      'Movimiento de stock registrado correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('does not show a success toast on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCreateStockMovement('p1'), {
      wrapper,
    });

    result.current.mutate({ quantity: 5 });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});

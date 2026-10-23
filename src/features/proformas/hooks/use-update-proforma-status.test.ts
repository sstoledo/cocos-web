import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildProforma } from '../test/fixtures';
import { useUpdateProformaStatus } from './use-update-proforma-status';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const proforma = buildProforma();

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

// Detail-page badge flips without a refresh: ['proforma', id] joins
// the ['proformas'] lists prefix invalidation (sale hook parity SL-F14).
describe('useUpdateProformaStatus', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('updates the status and invalidates both the proformas prefix and the proforma detail', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => proforma,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateProformaStatus(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'prof1', status: 'sent' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/proformas/prof1/status',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['proformas'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['proforma', 'prof1'],
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Estado de la proforma actualizado'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid transition',
        errorCode: 'INVALID_STATUS_TRANSITION',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateProformaStatus(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'prof1', status: 'sent' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['proformas'],
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['proforma', 'prof1'],
    });
    expect(toast.success).not.toHaveBeenCalled();
  });
});

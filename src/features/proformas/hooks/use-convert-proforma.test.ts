import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildConvertProformaPayload, buildProforma } from '../test/fixtures';
import { useConvertProforma } from './use-convert-proforma';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const proforma = buildProforma({ status: 'converted' });

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
describe('useConvertProforma', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('converts the proforma and invalidates both the proformas prefix and the proforma detail', async () => {
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

    const { result } = renderHook(() => useConvertProforma(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'prof1',
      payload: buildConvertProformaPayload({ paymentMethod: 'card' }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/proformas/prof1/convert-to-sale',
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
    expect(result.current.data).toEqual(proforma);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['proformas'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['proforma', 'prof1'],
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Proforma convertida a venta correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Not accepted',
        errorCode: 'PROFORMA_NOT_ACCEPTED',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useConvertProforma(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'prof1',
      payload: buildConvertProformaPayload(),
    });

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

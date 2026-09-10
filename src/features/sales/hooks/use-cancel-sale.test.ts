import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { useCancelSale } from './use-cancel-sale';

const sale = buildSale();

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

describe('useCancelSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('cancels the sale and invalidates the sales prefix and sale detail', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelSale(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('sale1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales/sale1/cancel',
      expect.objectContaining({ method: 'PATCH', credentials: 'include' })
    );
    expect(result.current.data).toEqual(sale);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sales'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sale', 'sale1'],
    });
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Sale already cancelled',
        errorCode: 'SALE_ALREADY_CANCELLED',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelSale(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('sale1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['sales'],
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['sale', 'sale1'],
    });
  });
});

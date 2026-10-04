import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteSupplier } from './use-delete-supplier';

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

describe('useDeleteSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a supplier', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useDeleteSupplier(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('s1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('invalidates the suppliers list query on success', async () => {
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

    const { result } = renderHook(() => useDeleteSupplier(), {
      wrapper: Wrapper,
    });

    result.current.mutate('s1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['suppliers', 'list'],
    });
  });
});

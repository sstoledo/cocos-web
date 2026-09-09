import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import type { SaleListFilters, SaleListResponse } from '../types';
import { useSales } from './use-sales';

const sale = buildSale();

const listResponse: SaleListResponse = {
  data: [sale],
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

describe('useSales', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches sales and derives totalPages from meta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const { result } = renderHook(() => useSales({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sales).toEqual([sale]);
    expect(result.current.meta).toEqual({ page: 1, total: 25, totalPages: 3 });
    expect(result.current.error).toBeNull();
  });

  it('returns empty defaults when there is no data', () => {
    globalThis.fetch = vi.fn().mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useSales({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.sales).toEqual([]);
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
      (props: { filters: SaleListFilters }) => useSales(props.filters),
      {
        initialProps: { filters: { status: 'completed', page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { status: 'completed', page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/sales?status=completed&page=2',
        { credentials: 'include' }
      )
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useSales({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { useSale } from './use-sale';

const sale = buildSale();

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

describe('useSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a sale by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => sale,
    });

    const { result } = renderHook(() => useSale('sale1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sales/sale1',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(sale);
  });

  it('scopes the query key by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sale,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { id: string }) => useSale(props.id),
      {
        initialProps: { id: 'sale1' },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ id: 'sale2' });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/sales/sale2',
        { credentials: 'include' }
      )
    );
  });

  it('does not fetch when the id is empty', () => {
    globalThis.fetch = vi.fn();

    const { result } = renderHook(() => useSale(''), {
      wrapper: createWrapper(),
    });

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('exposes the error when the sale is missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Sale not found',
        errorCode: 'SALE_NOT_FOUND',
      }),
    });

    const { result } = renderHook(() => useSale('missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

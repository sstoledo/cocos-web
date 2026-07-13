import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lot } from '../types';
import { useLots } from './use-lots';

const lot: Lot = {
  id: 'lot-1',
  lotNumber: 'L-2026-001',
  supplier: { id: 's1', name: 'Proveedor A' },
  receivedAt: '2026-07-13T12:00:00.000Z',
  notes: 'Notas de recepción',
  items: [
    {
      id: 'i1',
      product: { id: 'p1', name: 'Aceite 5W30' },
      quantity: 24,
      remainingQuantity: 24,
      costPrice: '12.50',
      expirationDate: '2027-01-01T00:00:00.000Z',
    },
  ],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe('useLots', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches lots without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [lot],
    });

    const { result } = renderHook(() => useLots(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lots',
      { credentials: 'include' }
    );
    expect(result.current.lots).toEqual([lot]);
    expect(result.current.error).toBeNull();
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [lot],
    });

    const filters = { q: 'L-2026' };
    const { result } = renderHook(() => useLots(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lots?q=L-2026',
      { credentials: 'include' }
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useLots(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lots).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('scopes the query key by filters', async () => {
    const firstFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [lot],
    });
    globalThis.fetch = firstFetch;

    const { result, rerender } = renderHook(
      (props: { filters: { q: string } }) => useLots(props.filters),
      {
        initialProps: { filters: { q: 'first' } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { q: 'second' } });

    await waitFor(() =>
      expect(firstFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/lots?q=second',
        { credentials: 'include' }
      )
    );
  });
});

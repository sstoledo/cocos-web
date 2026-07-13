import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import { useProducts } from './use-products';

const product: Product = {
  id: 'p1',
  code: 'COD-001',
  name: 'Producto 1',
  price: '10.00',
  isActive: true,
  presentation: { id: 'pres1', name: 'Unidad' },
  brand: { id: 'brand1', name: 'Marca 1' },
  category: { id: 'cat1', name: 'Categoría 1' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches products without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [product],
    });

    const { result } = renderHook(() => useProducts({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products',
      { credentials: 'include' }
    );
    expect(result.current.products).toEqual([product]);
    expect(result.current.error).toBeNull();
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [product],
    });

    const filters = { q: 'aceite', isActive: true };
    const { result } = renderHook(() => useProducts(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?q=aceite&isActive=true',
      { credentials: 'include' }
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useProducts({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('scopes the query key by filters', async () => {
    const firstFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [product],
    });
    globalThis.fetch = firstFetch;

    const { result, rerender } = renderHook(
      (props: { filters: { q: string } }) => useProducts(props.filters),
      {
        initialProps: { filters: { q: 'first' } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { q: 'second' } });

    await waitFor(() =>
      expect(firstFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?q=second',
        { credentials: 'include' }
      )
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductSearch } from './use-product-search';

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

const response = {
  data: [{ id: 'p1', code: 'PRD-001', name: 'Filtro de aceite' }],
  meta: { page: 1, limit: 20, total: 1 },
};

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the top 20 with an empty term', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const { result } = renderHook(() => useProductSearch(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?limit=20',
      expect.anything()
    );
  });

  it('sends the term as q and honors the isActive filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      (props: { query: string }) => useProductSearch(props.query, true),
      { wrapper, initialProps: { query: 'aceite' } }
    );

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?q=aceite&isActive=true&limit=20',
      expect.anything()
    );

    rerender({ query: 'filtro' });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?q=filtro&isActive=true&limit=20',
        expect.anything()
      )
    );
  });
});

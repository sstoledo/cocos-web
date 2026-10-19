import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSupplierSearch } from './use-supplier-search';

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
  data: [{ id: 's1', name: 'Proveedor 1' }],
  meta: { page: 1, limit: 20, total: 1 },
};

describe('useSupplierSearch', () => {
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

    const { result } = renderHook(() => useSupplierSearch(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.suppliers).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers?limit=20',
      expect.anything()
    );
  });

  it('sends the term as q and refetches on change', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      (props: { query: string }) => useSupplierSearch(props.query),
      { wrapper, initialProps: { query: 'distribuidora' } }
    );

    await waitFor(() => expect(result.current.suppliers).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers?q=distribuidora&limit=20',
      expect.anything()
    );

    rerender({ query: 'repuestos' });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/suppliers?q=repuestos&limit=20',
        expect.anything()
      )
    );
  });
});

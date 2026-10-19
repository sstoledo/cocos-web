import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClientSearch } from './use-client-search';

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
  data: [{ id: 'c1', name: 'Juan Pérez' }],
  meta: { page: 1, total: 1, totalPages: 1 },
};

describe('useClientSearch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the top 20 with the query param and empty term', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const { result } = renderHook(() => useClientSearch(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.clients).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients?limit=20',
      expect.anything()
    );
  });

  it('includes the search term in the request and the query key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      (props: { query: string }) => useClientSearch(props.query),
      { wrapper, initialProps: { query: 'juan' } }
    );

    await waitFor(() => expect(result.current.clients).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients?query=juan&limit=20',
      expect.anything()
    );

    rerender({ query: 'maria' });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/clients?query=maria&limit=20',
        expect.anything()
      )
    );
  });
});

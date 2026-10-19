import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useServiceSearch } from './use-service-search';

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
  data: [{ id: 's1', code: 'SRV-001', name: 'Cambio de aceite' }],
  meta: { page: 1, total: 1, totalPages: 1 },
};

describe('useServiceSearch', () => {
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

    const { result } = renderHook(() => useServiceSearch(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.services).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services?limit=20',
      expect.anything()
    );
  });

  it('sends the term as the query param and refetches on change', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      (props: { query: string }) => useServiceSearch(props.query),
      { wrapper, initialProps: { query: 'aceite' } }
    );

    await waitFor(() => expect(result.current.services).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services?query=aceite&limit=20',
      expect.anything()
    );

    rerender({ query: 'lavado' });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/services?query=lavado&limit=20',
        expect.anything()
      )
    );
  });
});

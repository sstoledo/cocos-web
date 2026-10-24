import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SEMANTIC_SEARCH_MIN_TERM_LENGTH,
  useProductSearch,
} from './use-product-search';

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

const legacyResponse = {
  data: [{ id: 'legacy', code: 'OIL', name: 'Legacy match' }],
  meta: { page: 1, limit: 20, total: 1 },
};

const semanticResponse = {
  data: [{ id: 'semantic', code: 'OIL-001', name: 'Semantic match' }],
};

function jsonResponse(body: unknown) {
  return { ok: true, json: async () => body };
}

function errorResponse(status: number, body: unknown = {}) {
  return { ok: false, status, json: async () => body };
}

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves the legacy top-20 search for an empty term', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(legacyResponse));

    const { result } = renderHook(() => useProductSearch(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?limit=20',
      { credentials: 'include' }
    );
  });

  it('uses legacy ILIKE search below the trimmed semantic threshold', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(legacyResponse));

    const { result } = renderHook(() => useProductSearch(' OI '), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(SEMANTIC_SEARCH_MIN_TERM_LENGTH).toBe(3);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products?q=OI&limit=20',
      { credentials: 'include' }
    );
  });

  it('uses semantic search at the threshold and honors isActive', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse(semanticResponse));

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      (props: { query: string }) => useProductSearch(props.query, true),
      { wrapper, initialProps: { query: ' aceite motor ' } }
    );

    await waitFor(() =>
      expect(result.current.products[0]?.id).toBe('semantic')
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/products/search/semantic?q=aceite+motor&limit=20&isActive=true',
      { credentials: 'include' }
    );

    rerender({ query: 'filtro' });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products/search/semantic?q=filtro&limit=20&isActive=true',
        { credentials: 'include' }
      )
    );
  });

  it('falls back to legacy search when embeddings are not configured', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        errorResponse(503, { errorCode: 'EMBEDDINGS_NOT_CONFIGURED' })
      )
      .mockResolvedValueOnce(jsonResponse(legacyResponse));

    const { result } = renderHook(() => useProductSearch('aceite motor'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products[0]?.id).toBe('legacy'));
    expect(result.current.error).toBeNull();
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/products?q=aceite+motor&limit=20',
      { credentials: 'include' }
    );
  });

  it('falls back to legacy search after a network failure', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Network down'))
      .mockResolvedValueOnce(jsonResponse(legacyResponse));

    const { result } = renderHook(() => useProductSearch('aceite motor'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products[0]?.id).toBe('legacy'));
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to legacy search after a server failure', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(jsonResponse(legacyResponse));

    const { result } = renderHook(() => useProductSearch('aceite motor'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.products[0]?.id).toBe('legacy'));
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('surfaces authentication failures without a silent fallback', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(401, { message: 'Unauthorized' }));

    const { result } = renderHook(() => useProductSearch('aceite motor'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatchObject({ status: 401 });
    expect(result.current.products).toEqual([]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

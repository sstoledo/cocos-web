import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductReferences } from './use-product-references';

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

const references = {
  presentations: [{ id: 'p1', name: 'Litro' }],
  brands: [{ id: 'b1', name: 'Castrol' }],
  categories: [{ id: 'c1', name: 'Lubricantes' }],
};

describe('useProductReferences', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches presentations, brands and categories in parallel', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.presentations,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.brands,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.categories,
      });

    const { result } = renderHook(() => useProductReferences(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations',
      { credentials: 'include' }
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/brands',
      { credentials: 'include' }
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/categories',
      { credentials: 'include' }
    );
    expect(result.current.presentations).toEqual(references.presentations);
    expect(result.current.brands).toEqual(references.brands);
    expect(result.current.categories).toEqual(references.categories);
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when any request fails', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.presentations,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.categories,
      });

    const { result } = renderHook(() => useProductReferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CategoryListResponse } from '../types';
import { useCategories } from './use-categories';

const mockCategories = [
  {
    id: 'c1',
    name: 'Categoría 1',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Categoría 2',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
];

const mockResponse: CategoryListResponse = {
  data: mockCategories,
  meta: { page: 1, limit: 10, total: 2 },
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches categories', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useCategories({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCategories({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.categories).toEqual([]);
  });
});

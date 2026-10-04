import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, CategoryFormValues } from '../types';
import { useCreateCategory } from './use-create-category';

const mockCategory: Category = {
  id: 'c1',
  name: 'Categoría Nueva',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const validValues: CategoryFormValues = {
  name: 'Categoría Nueva',
  parentId: null,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a category', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategory,
    });

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    result.current.mutate(validValues);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockCategory);
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    result.current.mutate(validValues);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

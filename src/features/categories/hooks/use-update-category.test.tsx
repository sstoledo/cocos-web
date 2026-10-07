import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, CategoryFormValues } from '../types';
import { useUpdateCategory } from './use-update-category';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockCategory: Category = {
  id: 'c1',
  name: 'Categoría Actualizada',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const updateValues: Partial<CategoryFormValues> = {
  name: 'Categoría Actualizada',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useUpdateCategory', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('updates a category', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategory,
    });

    const { result } = renderHook(() => useUpdateCategory(), { wrapper });

    result.current.mutate({ id: 'c1', values: updateValues });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockCategory);
    expect(toast.success).toHaveBeenCalledWith(
      'Categoría actualizada correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const { result } = renderHook(() => useUpdateCategory(), { wrapper });

    result.current.mutate({ id: 'c1', values: updateValues });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});

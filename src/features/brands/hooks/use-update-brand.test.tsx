import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand, BrandFormValues } from '../types';
import { useUpdateBrand } from './use-update-brand';

const mockBrand: Brand = {
  id: 'b1',
  name: 'Marca Actualizada',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const updateValues: Partial<BrandFormValues> = {
  name: 'Marca Actualizada',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useUpdateBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a brand', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrand,
    });

    const { result } = renderHook(() => useUpdateBrand(), { wrapper });

    result.current.mutate({ id: 'b1', values: updateValues });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockBrand);
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const { result } = renderHook(() => useUpdateBrand(), { wrapper });

    result.current.mutate({ id: 'b1', values: updateValues });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

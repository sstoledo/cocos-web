import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand, BrandFormValues } from '../types';
import { useCreateBrand } from './use-create-brand';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockBrand: Brand = {
  id: 'b1',
  name: 'Marca Nueva',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const validValues: BrandFormValues = {
  name: 'Marca Nueva',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateBrand', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('creates a brand', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrand,
    });

    const { result } = renderHook(() => useCreateBrand(), { wrapper });

    result.current.mutate(validValues);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockBrand);
    expect(toast.success).toHaveBeenCalledWith('Marca creada correctamente');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const { result } = renderHook(() => useCreateBrand(), { wrapper });

    result.current.mutate(validValues);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});

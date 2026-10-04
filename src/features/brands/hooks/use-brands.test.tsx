import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBrands } from './use-brands';

const mockBrands: Brand[] = [
  { id: 'b1', name: 'Marca 1', createdAt: '', updatedAt: '' },
  { id: 'b2', name: 'Marca 2', createdAt: '', updatedAt: '' },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useBrands', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches brands', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });

    const { result } = renderHook(() => useBrands({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.brands).toEqual(mockBrands);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useBrands({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.brands).toEqual([]);
  });
});

interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

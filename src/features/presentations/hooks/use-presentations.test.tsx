import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePresentations } from './use-presentations';

const mockPresentations: Presentation[] = [
  { id: 'p1', name: 'Presentación 1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Presentación 2', createdAt: '', updatedAt: '' },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePresentations', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches presentations', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });

    const { result } = renderHook(() => usePresentations({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.presentations).toEqual(mockPresentations);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePresentations({}), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.presentations).toEqual([]);
  });
});

interface Presentation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

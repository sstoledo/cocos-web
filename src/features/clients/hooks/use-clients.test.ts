import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { useClients } from './use-clients';

const client: Client = {
  id: 'c1',
  name: 'Juan Pérez',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const paginatedResponse = {
  data: [client],
  meta: { page: 1, total: 1, totalPages: 1 },
};

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

describe('useClients', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches and returns paginated clients', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    const { result } = renderHook(() => useClients({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.clients).toEqual([client]);
    expect(result.current.meta).toEqual(paginatedResponse.meta);
    expect(result.current.error).toBeNull();
  });

  it('scopes the query key by filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => paginatedResponse,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { filters: { query: string; page: number } }) =>
        useClients(props.filters),
      {
        initialProps: { filters: { query: 'first', page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ filters: { query: 'second', page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/clients?query=second&page=2',
        { credentials: 'include' }
      )
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useClients({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

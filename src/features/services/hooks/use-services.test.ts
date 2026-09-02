import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { useServices } from './use-services';

const service: Service = {
  id: 's1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  price: '150.00',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

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

describe('useServices', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches services without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [service],
    });

    const { result } = renderHook(() => useServices({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services',
      { credentials: 'include' }
    );
    expect(result.current.services).toEqual([service]);
    expect(result.current.error).toBeNull();
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [service],
    });

    const { result } = renderHook(() => useServices({ isActive: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services?isActive=true',
      { credentials: 'include' }
    );
  });

  it('exposes the error when the backend fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useServices({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.services).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

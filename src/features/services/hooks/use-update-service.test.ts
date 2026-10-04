import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { useUpdateService } from './use-update-service';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

const formValues = {
  code: 'SRV-001',
  name: 'Cambio de aceite y filtro',
  price: 180,
  estimatedDuration: 45,
  isActive: true,
};

const updatedService: Service = {
  id: 'srv-1',
  code: formValues.code,
  name: formValues.name,
  price: '180.00',
  estimatedDuration: formValues.estimatedDuration,
  isActive: formValues.isActive,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('useUpdateService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a service', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedService,
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'srv-1', values: formValues });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services/srv-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.name).toBe(formValues.name);
    expect(body.price).toBe(formValues.price);
    expect(result.current.data).toEqual(updatedService);
  });

  it('exposes the error when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'srv-1', values: formValues });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('invalidates the service list and detail queries on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedService,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'srv-1', values: formValues });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['services', 'list'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['services', 'detail', 'srv-1'],
    });
  });
});

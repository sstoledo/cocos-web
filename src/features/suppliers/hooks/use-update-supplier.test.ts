import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier, SupplierFormValues } from '../types';
import { useUpdateSupplier } from './use-update-supplier';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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

const values: Partial<SupplierFormValues> = {
  name: 'Proveedor Actualizado',
  phone: '999333444',
};

const updatedSupplier: Supplier = {
  id: 's1',
  name: 'Proveedor Actualizado',
  phone: '999333444',
  email: 'p1@example.com',
  address: 'Calle 1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('useUpdateSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('updates a supplier and returns the result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedSupplier,
    });

    const { result } = renderHook(() => useUpdateSupplier(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 's1', values });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedSupplier);
    expect(toast.success).toHaveBeenCalledWith(
      'Proveedor actualizado correctamente'
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('invalidates the suppliers list and detail queries on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedSupplier,
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

    const { result } = renderHook(() => useUpdateSupplier(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 's1', values });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['suppliers', 'list'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['supplier', 's1'],
    });
  });
});

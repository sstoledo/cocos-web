import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier, SupplierListFilters } from '../types';
import { useSuppliers } from './use-suppliers';

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

const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'Proveedor 1',
    phone: '999111222',
    email: 'p1@example.com',
    address: 'Calle 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    name: 'Proveedor 2',
    phone: null,
    email: null,
    address: null,
    isActive: false,
    deletedAt: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches suppliers with default filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const { result } = renderHook(() => useSuppliers({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.suppliers).toEqual(mockSuppliers);
    expect(result.current.error).toBeNull();
  });

  it('fetches suppliers with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const filters: SupplierListFilters = { q: 'Proveedor' };
    const { result } = renderHook(() => useSuppliers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.suppliers).toEqual(mockSuppliers);
  });

  it('handles fetch error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useSuppliers({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.suppliers).toEqual([]);
  });
});

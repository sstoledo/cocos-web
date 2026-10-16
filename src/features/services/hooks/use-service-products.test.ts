import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceProduct } from '../types';
import { useServiceProducts } from './use-service-products';

const serviceProducts: ServiceProduct[] = [
  {
    id: 'sp1',
    serviceId: 'svc-1',
    productId: 'p1',
    quantity: 2,
    product: {
      id: 'p1',
      code: 'COD-1',
      name: 'Aceite',
      consumptionType: 'partial',
    },
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
];

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useServiceProducts', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the service products under the service-products key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => serviceProducts,
    });

    const { result } = renderHook(() => useServiceProducts('svc-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services/svc-1/products',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(serviceProducts);
  });

  it('surfaces an ApiError when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useServiceProducts('svc-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({ status: 500 });
  });
});

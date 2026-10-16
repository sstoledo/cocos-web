import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConsumptionEvent } from '../types';
import { useWorkOrderConsumptions } from './use-work-order-consumptions';

const consumptions: ConsumptionEvent[] = [
  {
    id: 'ce1',
    workOrderId: 'wo1',
    productId: 'p1',
    product: {
      id: 'p1',
      code: 'COD-1',
      name: 'Aceite',
      consumptionType: 'partial',
    },
    type: 'opened',
    quantity: null,
    registeredById: 'u1',
    registeredBy: { id: 'u1', name: 'Ana García' },
    createdAt: '2024-01-15T10:00:00.000Z',
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

describe('useWorkOrderConsumptions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the consumptions under the work-order-consumptions key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => consumptions,
    });

    const { result } = renderHook(() => useWorkOrderConsumptions('wo1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1/consumptions',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(consumptions);
  });

  it('surfaces an ApiError when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useWorkOrderConsumptions('wo1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({ status: 500 });
  });
});

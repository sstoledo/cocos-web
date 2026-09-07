import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWorkOrder } from '../test/fixtures';
import { useTransitionWorkOrder } from './use-transition-work-order-status';

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useTransitionWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('transitions the work order status', async () => {
    const workOrder = buildWorkOrder({ status: 'in_progress' });
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const { result } = renderHook(() => useTransitionWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'wo1', status: 'in_progress' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1/status',
      expect.objectContaining({ method: 'PATCH', credentials: 'include' })
    );
    expect(result.current.data).toEqual(workOrder);
  });

  it('exposes the error when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Invalid transition',
        errorCode: 'INVALID_STATUS_TRANSITION',
      }),
    });

    const { result } = renderHook(() => useTransitionWorkOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'wo1', status: 'done' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      status: 409,
      errorCode: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('invalidates the list and the detail on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => buildWorkOrder({ status: 'done' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useTransitionWorkOrder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'wo1', status: 'done' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-orders'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-order', 'wo1'],
    });
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CashClosing, CreateCashClosingInput } from '../types';
import { useCreateCashClosing } from './use-create-cash-closing';

const cashClosing: CashClosing = {
  id: 'cc1',
  periodStart: '2026-09-23T00:00:00.000Z',
  periodEnd: '2026-09-23T20:00:00.000Z',
  expectedCash: '1250.00',
  expectedCard: '3400.50',
  expectedTransfer: '800.00',
  declaredCash: '1250.00',
  difference: '0.00',
  salesCount: 12,
  notes: null,
  createdAt: '2026-09-23T20:00:00.000Z',
  closedBy: { id: 'u1', name: 'Ana García' },
};

const input: CreateCashClosingInput = {
  declaredCash: '1250.00',
  notes: 'Todo en orden',
};

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

describe('useCreateCashClosing', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates the cash closing and invalidates the cash-closings prefix', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => cashClosing,
    });
    globalThis.fetch = fetchMock;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateCashClosing(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(cashClosing);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );
    // Prefix covers preview, list variants and detail keys.
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['cash-closings'],
    });
  });

  it('sends no notes key when omitted', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => cashClosing,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useCreateCashClosing(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ declaredCash: '1250.00' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings',
      expect.objectContaining({
        body: JSON.stringify({ declaredCash: '1250.00' }),
      })
    );
  });

  it('surfaces CLOSING_CONFLICT as an ApiError with errorCode', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Closing conflict',
        errorCode: 'CLOSING_CONFLICT',
      }),
    });

    const { result } = renderHook(() => useCreateCashClosing(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      status: 409,
      errorCode: 'CLOSING_CONFLICT',
    });
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Closing conflict',
        errorCode: 'CLOSING_CONFLICT',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateCashClosing(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['cash-closings'],
    });
  });
});

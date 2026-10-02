import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CashClosing } from '../types';
import { useCashClosing } from './use-cash-closing';

const cashClosing: CashClosing = {
  id: 'cc1',
  periodStart: '2026-09-22T00:00:00.000Z',
  periodEnd: '2026-09-22T23:59:59.000Z',
  expectedCash: '1250.00',
  expectedCard: '3400.50',
  expectedTransfer: '800.00',
  declaredCash: '1240.00',
  difference: '-10.00',
  salesCount: 12,
  notes: 'Faltan $10 en efectivo',
  createdAt: '2026-09-22T23:59:59.000Z',
  closedBy: { id: 'u1', name: 'Ana García' },
};

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useCashClosing', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the cash closing detail', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => cashClosing,
    });

    const { result } = renderHook(() => useCashClosing('cc1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings/cc1',
      { credentials: 'include' }
    );
    expect(result.current.data).toEqual(cashClosing);
  });

  it('caches under the detail key scoped by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => cashClosing,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useCashClosing('cc1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      queryClient.getQueryData(['cash-closings', 'detail', 'cc1'])
    ).toEqual(cashClosing);
  });

  it('stays disabled when the id is empty', () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useCashClosing(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces CASH_CLOSING_NOT_FOUND as an ApiError with errorCode', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Cash closing not found',
        errorCode: 'CASH_CLOSING_NOT_FOUND',
      }),
    });

    const { result } = renderHook(() => useCashClosing('missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      status: 404,
      errorCode: 'CASH_CLOSING_NOT_FOUND',
    });
  });
});

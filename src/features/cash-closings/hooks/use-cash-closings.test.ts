import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CashClosing,
  CashClosingListResponse,
  ListCashClosingsParams,
} from '../types';
import { useCashClosings } from './use-cash-closings';

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
  notes: null,
  createdAt: '2026-09-22T23:59:59.000Z',
  closedBy: { id: 'u1', name: 'Ana García' },
};

const listResponse: CashClosingListResponse = {
  data: [cashClosing],
  meta: { page: 1, limit: 10, total: 25 },
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

describe('useCashClosings', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches cash closings and derives totalPages from meta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const { result } = renderHook(() => useCashClosings({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cashClosings).toEqual([cashClosing]);
    expect(result.current.meta).toEqual({ page: 1, total: 25, totalPages: 3 });
    expect(result.current.error).toBeNull();
  });

  it('scopes the query key by params', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result, rerender } = renderHook(
      (props: { params: ListCashClosingsParams }) =>
        useCashClosings(props.params),
      {
        initialProps: { params: { page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ params: { page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/cash-closings?page=2',
        { credentials: 'include' }
      )
    );
  });

  it('sends page and limit when given', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(
      () => useCashClosings({ page: 3, limit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings?page=3&limit=20',
      { credentials: 'include' }
    );
  });

  it('calls the bare endpoint when no params are given', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useCashClosings({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cash-closings',
      { credentials: 'include' }
    );
  });
});

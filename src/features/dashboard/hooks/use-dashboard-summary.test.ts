import { ApiError } from '@/lib/api-error';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardSummary } from '../types';
import { useDashboardSummary } from './use-dashboard-summary';

const summary: DashboardSummary = {
  salesTodayCount: 4,
  salesMonthCount: 87,
  workOrders: { pending: 3, inProgress: 2, done: 41, cancelled: 1 },
  purchaseOrders: {
    draft: 2,
    ordered: 5,
    partiallyReceived: 1,
    received: 18,
    cancelled: 0,
  },
  notificationsUnread: 6,
  generatedAt: '2026-09-23T15:30:00.000Z',
};

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useDashboardSummary', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches the summary from the bare endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => summary,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.summary).toEqual(summary));
    expect(result.current.error).toBeNull();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/dashboard/summary',
      { credentials: 'include' }
    );
  });

  it('uses the fixed dashboard summary query key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => summary,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.summary).toEqual(summary));

    expect(queryClient.getQueryData(['dashboard', 'summary'])).toEqual(summary);
  });

  it('exposes loading state before data arrives', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => summary,
    });

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.summary).toBeUndefined();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('maps failures to ApiError with status and errorCode', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        message: 'Forbidden',
        errorCode: 'FORBIDDEN',
      }),
    });

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(ApiError));

    const error = result.current.error as ApiError;
    expect(error.status).toBe(403);
    expect(error.errorCode).toBe('FORBIDDEN');
    expect(error.message).toBe('Failed to fetch dashboard summary: 403');
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Notification } from '../types';
import { useMarkNotificationRead } from './use-mark-notification-read';

const notification: Notification = {
  id: 'n1',
  type: 'work_order_ready',
  title: 'Orden lista',
  body: 'La orden está lista para retirar',
  link: '/work-orders/wo1',
  readAt: '2026-09-23T13:00:00.000Z',
  createdAt: '2026-09-23T12:00:00.000Z',
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

describe('useMarkNotificationRead', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('marks the notification as read and invalidates notifications', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => notification,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('n1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // B11 contract: no-body PATCH, no Content-Type header.
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/notifications/n1/read',
      { method: 'PATCH', credentials: 'include' }
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
  });

  it('does not invalidate on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        message: 'Notification not found',
        errorCode: 'NOTIFICATION_NOT_FOUND',
      }),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('n1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
  });
});

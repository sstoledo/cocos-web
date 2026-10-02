import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ListNotificationsParams,
  Notification,
  NotificationListResponse,
} from '../types';
import { useNotifications } from './use-notifications';

const notification: Notification = {
  id: 'n1',
  type: 'work_order_ready',
  title: 'Orden lista',
  body: 'La orden está lista para retirar',
  link: '/work-orders/wo1',
  readAt: null,
  createdAt: '2026-09-23T12:00:00.000Z',
};

const listResponse: NotificationListResponse = {
  data: [notification],
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

describe('useNotifications', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches notifications and derives totalPages from meta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const { result } = renderHook(() => useNotifications({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notifications).toEqual([notification]);
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
      (props: { params: ListNotificationsParams }) =>
        useNotifications(props.params),
      {
        initialProps: { params: { unread: true, page: 1 } },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ params: { unread: true, page: 2 } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/notifications?unread=true&page=2',
        { credentials: 'include' }
      )
    );
  });

  it('omits the unread param when false and sends page/limit', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(
      () => useNotifications({ unread: false, page: 3, limit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/notifications?page=3&limit=20',
      { credentials: 'include' }
    );
  });

  it('calls the bare endpoint when no params are given', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useNotifications({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/notifications',
      { credentials: 'include' }
    );
  });
});

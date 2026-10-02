import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationListResponse } from '../types';
import { useUnreadNotificationsCount } from './use-unread-notifications-count';

const emptyResponse: NotificationListResponse = {
  data: [],
  meta: { page: 1, limit: 1, total: 7 },
};

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useUnreadNotificationsCount', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns meta.total from the unread list call', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => emptyResponse,
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useUnreadNotificationsCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.unreadCount).toBe(7));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/notifications?unread=true&limit=1',
      { credentials: 'include' }
    );
  });

  it('uses the fixed unread-count query key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => emptyResponse,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useUnreadNotificationsCount(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.unreadCount).toBe(7));

    expect(queryClient.getQueryData(['notifications', 'unread-count'])).toEqual(
      emptyResponse
    );
  });

  it('defaults to zero before data arrives and accepts refetchInterval', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => emptyResponse,
    });

    const { result } = renderHook(() => useUnreadNotificationsCount(30_000), {
      wrapper: createWrapper(),
    });

    expect(result.current.unreadCount).toBe(0);

    await waitFor(() => expect(result.current.unreadCount).toBe(7));
  });
});

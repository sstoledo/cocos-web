import { authClient } from '@/lib/auth-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from './useAuth';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useAuth', () => {
  it('returns the user when a session exists', async () => {
    const user = { id: '1', email: 'test@example.com' };
    vi.mocked(authClient.getSession).mockResolvedValueOnce({
      data: { session: { id: 'session-1' }, user },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it('returns null when no session exists', async () => {
    vi.mocked(authClient.getSession).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when session fetch fails', async () => {
    const error = new Error('Network error');
    vi.mocked(authClient.getSession).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(error);
  });
});

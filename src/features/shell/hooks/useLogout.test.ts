import { authClient } from '@/lib/auth-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { useLogout } from './useLogout';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      null,
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  }

  return { queryClient, Wrapper };
}

describe('useLogout', () => {
  it('clears the whole query cache so no stale role survives', async () => {
    vi.mocked(authClient.signOut).mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(['auth', 'session', 'user'], {
      id: 'previous-user',
      role: { name: 'Admin' },
    });

    const { result } = renderHook(() => useLogout(), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      queryClient.getQueryData(['auth', 'session', 'user'])
    ).toBeUndefined();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});

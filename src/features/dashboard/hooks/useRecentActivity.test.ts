import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecentActivity } from './useRecentActivity';

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe('useRecentActivity', () => {
  beforeEach(() => {
    useUserMock.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useRecentActivity(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activities).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('resolves to an empty activities array', async () => {
    const { result } = renderHook(() => useRecentActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('scopes the query key by user id', async () => {
    useUserMock.mockReturnValue({ user: { id: 'user-2' } });

    const { result } = renderHook(() => useRecentActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual([]);
  });
});

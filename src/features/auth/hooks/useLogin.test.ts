import { authClient } from '@/lib/auth-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useLogin } from './useLogin';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
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

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useLogin', () => {
  it('signs in with email and password', async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
      data: { user: { id: '1' } },
      error: null,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@example.com', password: 'secret' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret',
    });
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when sign in fails', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(authClient.signIn.email).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@example.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});

import { authClient } from '@/lib/auth-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useRegister } from './useRegister';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
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

describe('useRegister', () => {
  it('signs up with email, password and name', async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValueOnce({
      data: { user: { id: '1' } },
      error: null,
    });

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'test@example.com',
      password: 'secret',
      name: 'Test User',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authClient.signUp.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret',
      name: 'Test User',
    });
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when sign up fails', async () => {
    const error = new Error('Email already in use');
    vi.mocked(authClient.signUp.email).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'test@example.com',
      password: 'wrong',
      name: 'Test User',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});

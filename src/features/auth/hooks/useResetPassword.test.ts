import { authClient } from '@/lib/auth-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useResetPassword } from './useResetPassword';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    sendVerificationEmail: vi.fn(),
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

describe('useResetPassword', () => {
  it('sends a verification email for the given address', async () => {
    vi.mocked(authClient.sendVerificationEmail).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authClient.sendVerificationEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when sending fails', async () => {
    const error = new Error('User not found');
    vi.mocked(authClient.sendVerificationEmail).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: 'test@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});

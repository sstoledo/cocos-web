import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserMenu } from './UserMenu';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderWithQueryClient(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
}

const { signOutMock, navigateMock, invalidateQueriesMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  navigateMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: signOutMock,
  },
}));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query'
  );
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: invalidateQueriesMock,
    }),
  };
});

describe('UserMenu', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    signOutMock.mockResolvedValue({ data: null, error: null });
    navigateMock.mockReset();
    invalidateQueriesMock.mockReset();
  });

  it('renders user name and email', () => {
    renderWithQueryClient(
      <UserMenu name="Juan Pérez" email="juan@example.com" />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
  });

  it('calls signOut and redirects to login on logout', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <UserMenu name="Juan Pérez" email="juan@example.com" />
    );

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['auth'] })
    );
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });
});

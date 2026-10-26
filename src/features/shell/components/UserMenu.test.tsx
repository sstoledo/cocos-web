import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
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
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const { signOutMock, navigateMock, clearMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  navigateMock: vi.fn(),
  clearMock: vi.fn(),
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
      clear: clearMock,
    }),
  };
});

describe('UserMenu', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    signOutMock.mockResolvedValue({ data: null, error: null });
    navigateMock.mockReset();
    clearMock.mockReset();
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
    await waitFor(() => expect(clearMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });

  it('renders only avatar and logout when compact', () => {
    renderWithQueryClient(
      <UserMenu name="Juan Pérez" email="juan@example.com" compact />
    );

    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('juan@example.com')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });

  it('opens the profile dropdown with profile and logout actions', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <UserMenu name="Juan Pérez" email="juan@example.com" dropdown />
    );

    expect(
      screen.queryByRole('menuitem', { name: 'Perfil' })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de perfil' })
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Perfil' })).toHaveAttribute(
      'href',
      '/profile'
    );
    expect(
      screen.getByRole('menuitem', { name: 'Cerrar sesión' })
    ).toBeInTheDocument();
  });

  it('logs out from the profile dropdown', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <UserMenu name="Juan Pérez" email="juan@example.com" dropdown />
    );

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de perfil' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });
});

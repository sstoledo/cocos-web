import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteGuard } from './RouteGuard';

const useUserMock = vi.fn();

vi.mock('../hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it('renders loading state while fetching user', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <RouteGuard routePath="/products">protected</RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <RouteGuard routePath="/products">protected</RouteGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('allows access for authorized role', () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Ana',
        email: 'ana@example.com',
        role: { id: 'r1', name: 'Admin' },
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <RouteGuard routePath="/users">protected</RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
  });

  it('redirects to unauthorized when role lacks permission', () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Pedro',
        email: 'pedro@example.com',
        role: { id: 'r2', name: 'Mechanic' },
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/users']}>
        <RouteGuard routePath="/users">protected</RouteGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });
});

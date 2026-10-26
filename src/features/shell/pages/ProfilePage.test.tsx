import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';

const { useUserMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
}));

vi.mock('../hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it('shows the current user name, email and role without editing', () => {
    useUserMock.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: { id: 'role-1', name: 'Reception' },
      },
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Reception')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /editar/i })
    ).not.toBeInTheDocument();
  });

  it('shows a loading state', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    });

    render(<ProfilePage />);

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });
});

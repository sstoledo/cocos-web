import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from '../pages/Layout';

const useUserMock = vi.fn();

vi.mock('../hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

vi.mock('./Header', () => ({
  Header: ({ name, email }: { name: string; email: string }) => (
    <div data-testid="header">
      {name} {email}
    </div>
  ),
}));

vi.mock('./Sidebar', () => ({
  Sidebar: ({ role }: { role: string }) => (
    <div data-testid="sidebar">{role}</div>
  ),
}));

describe('Layout', () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it('shows loading state while fetching user', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('does not render header or sidebar when user is not authenticated', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('renders header and sidebar for authenticated user', () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Juan',
        email: 'juan@example.com',
        role: { id: 'r1', name: 'Admin' },
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('header')).toHaveTextContent(
      'Juan juan@example.com'
    );
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Admin');
  });
});

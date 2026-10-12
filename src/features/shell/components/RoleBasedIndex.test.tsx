import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleBasedIndex } from './RoleBasedIndex';

const useUserMock = vi.fn();

vi.mock('../hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

function renderIndex() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<RoleBasedIndex />} />
        <Route path="/dashboard" element={<div>dashboard page</div>} />
        <Route path="/work-orders" element={<div>work orders page</div>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RoleBasedIndex', () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it('renders loading state while fetching user', () => {
    useUserMock.mockReturnValue({ user: null, isLoading: true, error: null });

    renderIndex();

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('redirects to login when user has no role', () => {
    useUserMock.mockReturnValue({ user: null, isLoading: false, error: null });

    renderIndex();

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects Mechanic to work orders', () => {
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

    renderIndex();

    expect(screen.getByText('work orders page')).toBeInTheDocument();
  });

  it('redirects Admin to dashboard', () => {
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

    renderIndex();

    expect(screen.getByText('dashboard page')).toBeInTheDocument();
  });
});

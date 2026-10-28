import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { UserTable } from './UserTable';

const user: User = {
  id: 'user-1',
  name: 'Ana López',
  email: 'ana@example.com',
  isActive: true,
  role: { id: 'role-1', name: 'Admin' },
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};

describe('UserTable', () => {
  it('renders the approved mobile user card with status and actions', () => {
    render(
      <MemoryRouter>
        <UserTable users={[user]} onDelete={vi.fn()} onAssignRole={vi.fn()} />
      </MemoryRouter>
    );

    const card = screen.getByTestId('user-mobile-card');
    expect(card).toHaveTextContent('Ana López');
    expect(card).toHaveTextContent('ana@example.com');
    expect(card).toHaveTextContent('Admin');
    expect(card).toHaveTextContent('Activo');
    expect(
      screen.getAllByRole('link', { name: 'Ana López' })[0]
    ).toHaveAttribute('href', '/users/user-1');
  });

  it('uses destructive for inactive users and keeps empty state', () => {
    const { rerender } = render(
      <MemoryRouter>
        <UserTable
          users={[{ ...user, isActive: false }]}
          onDelete={vi.fn()}
          onAssignRole={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Inactivo')[0]).toHaveClass('bg-destructive');

    rerender(
      <MemoryRouter>
        <UserTable users={[]} onDelete={vi.fn()} onAssignRole={vi.fn()} />
      </MemoryRouter>
    );
    expect(
      screen.getByText('No hay usuarios registrados.')
    ).toBeInTheDocument();
  });
});

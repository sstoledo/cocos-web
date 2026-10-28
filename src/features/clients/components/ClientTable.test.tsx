import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { ClientTable } from './ClientTable';

const client: Client = {
  id: 'c1',
  name: 'Juan Pérez',
  identification: '12345678',
  identificationType: 'DNI',
  phone: '999888777',
  email: 'juan@example.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderTable(props: { canEdit: boolean; onDelete?: () => void }) {
  return render(
    <MemoryRouter>
      <ClientTable clients={[client]} {...props} />
    </MemoryRouter>
  );
}

describe('ClientTable', () => {
  it('renders the approved mobile client card with all actions', () => {
    renderTable({ canEdit: true });

    const card = screen.getByTestId('client-mobile-card');
    expect(card).toHaveTextContent('Juan Pérez');
    expect(card).toHaveTextContent('DNI 12345678');
    expect(card).toHaveTextContent('juan@example.com');
    expect(screen.getAllByRole('link', { name: /ver/i })[0]).toHaveAttribute(
      'href',
      '/clients/c1'
    );
    expect(screen.getAllByRole('link', { name: /editar/i })[0]).toHaveAttribute(
      'href',
      '/clients/c1/edit'
    );
  });

  it('renders client data', () => {
    renderTable({ canEdit: false });

    expect(
      screen.getByRole('cell', { name: 'Juan Pérez' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'DNI 12345678' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '999888777' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'juan@example.com' })
    ).toBeInTheDocument();
  });

  it('shows view action for all users', () => {
    renderTable({ canEdit: false });

    expect(screen.getAllByRole('link', { name: /ver/i })[0]).toHaveAttribute(
      'href',
      '/clients/c1'
    );
  });

  it('shows edit and delete actions for editable roles', () => {
    renderTable({ canEdit: true });

    expect(screen.getAllByRole('link', { name: /editar/i })[0]).toHaveAttribute(
      'href',
      '/clients/c1/edit'
    );
    expect(
      screen.getAllByRole('button', { name: /eliminar/i })[0]
    ).toBeInTheDocument();
  });

  it('hides edit and delete actions for read-only roles', () => {
    renderTable({ canEdit: false });

    expect(
      screen.queryByRole('link', { name: /editar/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /eliminar/i })
    ).not.toBeInTheDocument();
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderTable({ canEdit: true, onDelete });

    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    expect(onDelete).toHaveBeenCalledWith(client);
  });
});

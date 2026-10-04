import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../types';
import { SupplierTable } from './SupplierTable';

const supplier: Supplier = {
  id: 's1',
  name: 'Proveedor 1',
  phone: '999111222',
  email: 'p1@example.com',
  address: 'Calle 1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const inactiveSupplier: Supplier = {
  id: 's2',
  name: 'Proveedor 2',
  phone: null,
  email: null,
  address: null,
  isActive: false,
  deletedAt: null,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

function renderTable(props: {
  canEdit: boolean;
  onDelete?: () => void;
  suppliers?: Supplier[];
}) {
  return render(
    <MemoryRouter>
      <SupplierTable
        suppliers={props.suppliers ?? [supplier, inactiveSupplier]}
        {...props}
      />
    </MemoryRouter>
  );
}

describe('SupplierTable', () => {
  it('renders supplier data', () => {
    renderTable({ canEdit: false });

    expect(
      screen.getByRole('cell', { name: 'Proveedor 1' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '999111222' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'p1@example.com' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Calle 1' })).toBeInTheDocument();
  });

  it('shows empty values as dash', () => {
    renderTable({ canEdit: false });

    expect(screen.getAllByRole('cell', { name: '—' }).length).toBeGreaterThan(
      0
    );
  });

  it('shows active badge for active supplier', () => {
    renderTable({ canEdit: false });

    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows inactive badge for inactive supplier', () => {
    renderTable({ canEdit: false });

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('shows view action for all users', () => {
    renderTable({ canEdit: false });

    const viewLinks = screen.getAllByRole('link', { name: /ver/i });
    expect(viewLinks).toHaveLength(2);
    expect(viewLinks[0]).toHaveAttribute('href', '/suppliers/s1');
    expect(viewLinks[1]).toHaveAttribute('href', '/suppliers/s2');
  });

  it('shows edit and delete actions for editable roles', () => {
    renderTable({ canEdit: true });

    const editLinks = screen.getAllByRole('link', { name: /editar/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/suppliers/s1/edit');
    expect(editLinks[1]).toHaveAttribute('href', '/suppliers/s2/edit');

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
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

    renderTable({ canEdit: true, onDelete, suppliers: [supplier] });

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onDelete).toHaveBeenCalledWith(supplier);
  });

  it('shows empty state message when no suppliers', () => {
    render(
      <MemoryRouter>
        <SupplierTable suppliers={[]} canEdit={true} />
      </MemoryRouter>
    );

    expect(
      screen.getByText('No se encontraron proveedores.')
    ).toBeInTheDocument();
  });
});

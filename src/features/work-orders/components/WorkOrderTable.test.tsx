import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { WorkOrder } from '../types';
import { WorkOrderTable } from './WorkOrderTable';

const workOrder: WorkOrder = {
  id: 'wo1',
  orderNumber: 'OT-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Ford', model: 'Fiesta' },
  description: 'Cambio de aceite',
  status: 'pending',
  totalAmount: '15000.00',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  products: [],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

function renderTable(workOrders: WorkOrder[] = [workOrder]) {
  return render(
    <MemoryRouter>
      <WorkOrderTable workOrders={workOrders} />
    </MemoryRouter>
  );
}

describe('WorkOrderTable', () => {
  it('renders work order data', () => {
    renderTable();

    expect(screen.getByRole('cell', { name: 'OT-0001' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Juan Pérez' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'ABC123 · Ford Fiesta' })
    ).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '15000.00' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: new Date('2024-01-15T00:00:00.000Z').toLocaleDateString('es-AR'),
      })
    ).toBeInTheDocument();
  });

  it('links each row to the work order detail', () => {
    renderTable();

    expect(screen.getByRole('link', { name: /ver/i })).toHaveAttribute(
      'href',
      '/work-orders/wo1'
    );
  });

  it('shows an empty state when there are no work orders', () => {
    renderTable([]);

    expect(
      screen.getByText('No se encontraron órdenes de trabajo.')
    ).toBeInTheDocument();
  });
});

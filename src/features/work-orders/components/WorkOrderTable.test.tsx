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
  paidAmount: '0.00',
  paymentStatus: 'pending',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
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
    expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ford Fiesta').length).toBeGreaterThan(0);
    // Two desktop badges and two mobile-card badges.
    expect(screen.getAllByText('Pendiente')).toHaveLength(4);
    expect(screen.getByRole('cell', { name: '15000.00' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: new Date('2024-01-15T00:00:00.000Z').toLocaleDateString('es-AR'),
      })
    ).toBeInTheDocument();
  });

  it('renders the approved mobile work-order card', () => {
    renderTable();

    const card = screen.getByTestId('work-order-mobile-card');
    expect(card).toHaveTextContent('OT-0001');
    expect(card).toHaveTextContent('Juan Pérez');
    expect(card).toHaveTextContent('ABC123');
    expect(card).toHaveTextContent('Ford Fiesta');
    expect(card).toHaveTextContent('Cobro: Pendiente');
    expect(card).toHaveTextContent('15000.00');
    expect(
      screen.getAllByRole('link', { name: /ver detalle/i })[0]
    ).toHaveAttribute('href', '/work-orders/wo1');
  });

  it('links each row to the work order detail', () => {
    renderTable();

    expect(screen.getAllByRole('link', { name: /ver/i })[0]).toHaveAttribute(
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

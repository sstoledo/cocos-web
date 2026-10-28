import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import { PurchaseOrderTable } from './PurchaseOrderTable';

describe('PurchaseOrderTable', () => {
  it('renders desktop data and detail links', () => {
    render(
      <MemoryRouter>
        <PurchaseOrderTable purchaseOrders={[buildPurchaseOrder()]} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('cell', { name: 'COM-2024-000001' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Repuestos SA' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '500.00' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ver/i })[0]).toHaveAttribute(
      'href',
      '/purchase-orders/po1'
    );
  });

  it('renders the approved mobile purchase-order card', () => {
    render(
      <MemoryRouter>
        <PurchaseOrderTable purchaseOrders={[buildPurchaseOrder()]} />
      </MemoryRouter>
    );

    const card = screen.getByTestId('purchase-order-mobile-card');
    expect(card).toHaveTextContent('COM-2024-000001');
    expect(card).toHaveTextContent('Repuestos SA');
    expect(card).toHaveTextContent('Borrador');
    expect(card).toHaveTextContent('500.00');
  });

  it('keeps the empty state', () => {
    render(
      <MemoryRouter>
        <PurchaseOrderTable purchaseOrders={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText('No se encontraron órdenes de compra.')
    ).toBeInTheDocument();
  });
});

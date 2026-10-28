import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { buildSale } from '../test/fixtures';
import { SalesTable } from './SalesTable';

function renderTable(
  sales = [buildSale()],
  mode: 'sales' | 'refunds' = 'sales'
) {
  return render(
    <MemoryRouter>
      <SalesTable sales={sales} mode={mode} />
    </MemoryRouter>
  );
}

describe('SalesTable', () => {
  it('renders the sale number, client, payment, total, status and date', () => {
    renderTable();

    expect(
      screen.getByRole('columnheader', { name: 'N° Venta' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Cliente' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Método de pago' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Total' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Estado' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Fecha' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('cell', { name: 'VTA-2026-000001' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Juan Pérez' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Efectivo' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '80.50' })).toBeInTheDocument();
    expect(screen.getAllByText('Completada').length).toBeGreaterThan(0);
  });

  it('uses the sales column order and renders mobile sale cards', () => {
    renderTable();

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual([
      'N° Venta',
      'Fecha',
      'Cliente',
      'Método de pago',
      'Estado',
      'Total',
      'Acciones',
    ]);
    expect(screen.getByTestId('sale-mobile-card')).toHaveTextContent(
      'VTA-2026-000001'
    );
    expect(screen.getByTestId('sale-mobile-card')).toHaveTextContent('80.50');
  });

  it('uses refunds column order, neutral payment badges and mobile audit cards', () => {
    renderTable([buildSale({ status: 'cancelled' })], 'refunds');

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual([
      'N° Venta',
      'Fecha',
      'Cliente',
      'Método de pago',
      'Total',
      'Estado',
      'Acciones',
    ]);
    expect(screen.getAllByText('Efectivo')[0]).toHaveClass('bg-muted');
    expect(screen.getByTestId('refund-mobile-card')).toHaveTextContent(
      'Cancelada'
    );
    expect(screen.getAllByRole('link', { name: 'Ver' }).length).toBeGreaterThan(
      0
    );
  });

  it('links each row to the sale detail', () => {
    renderTable();

    const viewLink = screen.getAllByRole('link', { name: /ver/i })[0];
    expect(viewLink).toHaveAttribute('href', '/sales/sale1');
  });

  it('falls back to Cliente ocasional for walk-in sales', () => {
    renderTable([buildSale({ client: null, clientId: null })]);

    expect(
      screen.getByRole('cell', { name: 'Cliente ocasional' })
    ).toBeInTheDocument();
  });

  it('renders an empty state when there are no sales', () => {
    renderTable([]);

    expect(screen.getByText('No se encontraron ventas.')).toBeInTheDocument();
  });
});

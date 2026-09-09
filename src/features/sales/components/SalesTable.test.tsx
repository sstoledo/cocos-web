import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { buildSale } from '../test/fixtures';
import { SalesTable } from './SalesTable';

function renderTable(sales = [buildSale()]) {
  return render(
    <MemoryRouter>
      <SalesTable sales={sales} />
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
    expect(screen.getByRole('cell', { name: '380.50' })).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
  });

  it('links each row to the sale detail', () => {
    renderTable();

    const viewLink = screen.getByRole('link', { name: /ver/i });
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

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Lot } from '../types';
import { LotTable } from './LotTable';

const lot: Lot = {
  id: 'lot-1',
  lotNumber: 'LOT-2026-0001',
  supplier: { id: 'supplier-1', name: 'Repuestos Lima SAC' },
  receivedAt: '2026-10-25T12:00:00.000Z',
  items: [
    {
      id: 'item-1',
      product: { id: 'product-1', name: 'Filtro de aceite' },
      quantity: 10,
      remainingQuantity: 4,
      costPrice: '45.50',
      expirationDate: '2099-12-31',
    },
  ],
};

describe('LotTable', () => {
  it('renders lot data and stock status with tokens', () => {
    render(<LotTable lots={[lot]} />);

    expect(
      screen.getByRole('cell', { name: 'LOT-2026-0001' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('En stock')[0]).toHaveClass('bg-success');
  });

  it('renders the approved mobile lot card', () => {
    render(<LotTable lots={[lot]} />);

    const card = screen.getByTestId('lot-mobile-card');
    expect(card).toHaveTextContent('LOT-2026-0001');
    expect(card).toHaveTextContent('Repuestos Lima SAC');
    expect(card).toHaveTextContent('1 producto');
  });

  it('uses destructive for exhausted lots and keeps empty state', () => {
    const exhausted = {
      ...lot,
      items: lot.items.map((item) => ({ ...item, remainingQuantity: 0 })),
    };
    const { rerender } = render(<LotTable lots={[exhausted]} />);

    expect(screen.getAllByText('Agotado')[0]).toHaveClass('bg-destructive');

    rerender(<LotTable lots={[]} />);
    expect(screen.getByText('No se encontraron lotes.')).toBeInTheDocument();
  });
});

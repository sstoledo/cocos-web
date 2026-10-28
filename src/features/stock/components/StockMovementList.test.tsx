import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockMovementList } from './StockMovementList';

const movement = {
  id: 'movement-1',
  type: 'entry',
  quantity: 4,
  reason: 'Receive COM-2026-000123',
  createdAt: '2026-10-25T12:00:00.000Z',
  lotItem: { lot: { lotNumber: 'COM-2026-000123-R1' } },
};

describe('StockMovementList', () => {
  it('renders movement data and the mobile movement card', () => {
    render(<StockMovementList movements={[movement]} />);

    expect(screen.getByRole('cell', { name: 'entry' })).toBeInTheDocument();
    const card = screen.getByTestId('stock-movement-mobile-card');
    expect(card).toHaveTextContent('entry');
    expect(card).toHaveTextContent('4');
    expect(card).toHaveTextContent('COM-2026-000123-R1');
  });

  it('keeps the empty state', () => {
    render(<StockMovementList movements={[]} />);

    expect(
      screen.getByText('No se encontraron movimientos.')
    ).toBeInTheDocument();
  });
});

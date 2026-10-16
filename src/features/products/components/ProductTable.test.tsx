import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Product } from '../types';
import { ProductTable } from './ProductTable';

const product: Product = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'brand1', name: 'Castrol' },
  category: { id: 'cat1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderTable(canEdit: boolean) {
  return render(
    <MemoryRouter>
      <ProductTable products={[product]} canEdit={canEdit} />
    </MemoryRouter>
  );
}

describe('ProductTable', () => {
  it('always shows the view action', () => {
    renderTable(false);

    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute(
      'href',
      '/products/p1'
    );
  });

  it('always shows the stock action', () => {
    renderTable(false);

    expect(screen.getByRole('link', { name: 'Stock' })).toHaveAttribute(
      'href',
      '/products/p1/stock'
    );
  });

  it('shows the edit action when canEdit is true', () => {
    renderTable(true);

    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/products/p1/edit'
    );
  });

  it('hides the edit action when canEdit is false', () => {
    renderTable(false);

    expect(
      screen.queryByRole('link', { name: 'Editar' })
    ).not.toBeInTheDocument();
  });
});

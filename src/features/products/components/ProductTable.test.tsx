import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { ProductListItem } from '../types';
import { ProductTable } from './ProductTable';

const product: ProductListItem = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  stock: 7,
  imageUrl: null,
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'brand1', name: 'Castrol' },
  category: { id: 'cat1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderTable(
  canEdit: boolean,
  products: ProductListItem[] = [product]
) {
  return render(
    <MemoryRouter>
      <ProductTable products={products} canEdit={canEdit} />
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

  it('shows the product stock', () => {
    renderTable(false);

    expect(screen.getByRole('cell', { name: '7' })).toBeInTheDocument();
  });

  it('shows a placeholder when the product has no image', () => {
    renderTable(false);

    expect(screen.getByRole('img', { name: 'Sin imagen' })).toBeInTheDocument();
  });

  it('shows a resized thumbnail when the product has an image', () => {
    const withImage: ProductListItem = {
      ...product,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/abc123',
    };

    renderTable(false, [withImage]);

    const image = screen.getByRole('img', { name: 'Aceite 20W50' });
    expect(image).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/demo/image/upload/w_40,h_40,c_fill,f_auto/abc123'
    );
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});

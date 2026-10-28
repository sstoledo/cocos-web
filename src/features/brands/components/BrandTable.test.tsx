import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Brand } from '../types';
import { BrandTable } from './BrandTable';

const mockBrands: Brand[] = [
  {
    id: 'b1',
    name: 'Marca 1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'b2',
    name: 'Marca 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

function renderTable(
  props: {
    brands?: Brand[];
    canEdit?: boolean;
    onDelete?: (b: Brand) => void;
  } = {}
) {
  const { brands = [], canEdit = false, onDelete } = props;
  return render(
    <MemoryRouter>
      <BrandTable brands={brands} canEdit={canEdit} onDelete={onDelete} />
    </MemoryRouter>
  );
}

describe('BrandTable', () => {
  it('renders brands in table', () => {
    renderTable({ brands: mockBrands });
    expect(screen.getAllByText('Marca 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marca 2').length).toBeGreaterThan(0);
  });

  it('shows empty state when no brands', () => {
    renderTable({ brands: [] });
    expect(screen.getByText('No se encontraron marcas.')).toBeInTheDocument();
  });

  it('renders the approved mobile brand card', () => {
    renderTable({ brands: [mockBrands[0]], canEdit: true });

    expect(screen.getByTestId('brand-mobile-card')).toHaveTextContent(
      'Marca 1'
    );
    expect(screen.getAllByRole('link', { name: 'Ver' })[0]).toHaveAttribute(
      'href',
      '/brands/b1'
    );
  });

  it('shows edit and delete buttons when canEdit is true', () => {
    renderTable({ brands: mockBrands, canEdit: true });
    expect(screen.getAllByRole('link', { name: /Editar/ })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(4);
  });

  it('hides edit and delete buttons when canEdit is false', () => {
    renderTable({ brands: mockBrands, canEdit: false });
    expect(
      screen.queryByRole('link', { name: /Editar/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Eliminar/ })
    ).not.toBeInTheDocument();
  });
});

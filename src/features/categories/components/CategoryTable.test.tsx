import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Category } from '../types';
import { CategoryTable } from './CategoryTable';

const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Categoría 1',
    parentId: null,
    parent: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'Subcategoría',
    parentId: 'c1',
    parent: {
      id: 'c1',
      name: 'Categoría 1',
      parentId: null,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

function renderTable(
  props: {
    categories?: Category[];
    canEdit?: boolean;
    onDelete?: (c: Category) => void;
  } = {}
) {
  const { categories = [], canEdit = false, onDelete } = props;
  return render(
    <MemoryRouter>
      <CategoryTable
        categories={categories}
        canEdit={canEdit}
        onDelete={onDelete}
      />
    </MemoryRouter>
  );
}

describe('CategoryTable', () => {
  it('renders categories in table', () => {
    renderTable({ categories: mockCategories });
    // Check for category names using getAllByText since "Categoría 1" appears twice
    expect(screen.getAllByText('Categoría 1')).toHaveLength(2);
    expect(screen.getByText('Subcategoría')).toBeInTheDocument();
  });

  it('shows parent category name for subcategory', () => {
    renderTable({ categories: mockCategories });
    // The second row (Subcategoría) has parent "Categoría 1"
    expect(screen.getByText('Subcategoría')).toBeInTheDocument();
    expect(screen.getAllByText('Categoría 1')).toHaveLength(2);
  });

  it('shows dash when no parent', () => {
    renderTable({ categories: mockCategories });
    // The first row (Categoría 1) has no parent, should show —
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows empty state when no categories', () => {
    renderTable({ categories: [] });
    expect(
      screen.getByText('No se encontraron categorías.')
    ).toBeInTheDocument();
  });

  it('shows edit and delete buttons when canEdit is true', () => {
    renderTable({ categories: mockCategories, canEdit: true });
    expect(screen.getAllByRole('link', { name: /Editar/ })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(2);
  });

  it('hides edit and delete buttons when canEdit is false', () => {
    renderTable({ categories: mockCategories, canEdit: false });
    expect(
      screen.queryByRole('link', { name: /Editar/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Eliminar/ })
    ).not.toBeInTheDocument();
  });
});

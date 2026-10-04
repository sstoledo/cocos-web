import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Category, CategoryFormValues } from '../types';
import { CategoryForm } from './CategoryForm';

const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Categoría Padre',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Otra Categoría',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
];

function renderForm(
  props: {
    onSubmit?: () => void;
    initialValues?: CategoryFormValues;
    categories?: Category[];
    currentCategoryId?: string;
  } = {}
) {
  return render(
    <MemoryRouter>
      <CategoryForm
        onSubmit={props.onSubmit ?? vi.fn()}
        initialValues={props.initialValues}
        categories={props.categories ?? mockCategories}
        currentCategoryId={props.currentCategoryId}
      />
    </MemoryRouter>
  );
}

describe('CategoryForm', () => {
  it('renders the form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Categoría padre (opcional)')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear categoría' })
    ).toBeInTheDocument();
  });

  it('shows parent category options', () => {
    renderForm();
    expect(
      screen.getByRole('option', { name: 'Sin categoría padre' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Categoría Padre' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Otra Categoría' })
    ).toBeInTheDocument();
  });

  it('excludes current category from parent options in edit mode', () => {
    renderForm({
      currentCategoryId: 'c1',
    });
    expect(
      screen.queryByRole('option', { name: 'Categoría Padre' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Otra Categoría' })
    ).toBeInTheDocument();
  });

  it('blocks submit with invalid name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'a'.repeat(101));
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El nombre no puede tener más de 100 caracteres'
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Categoría Ejemplo');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Categoría Ejemplo');
    expect(values.parentId).toBeNull();
  });

  it('calls onSubmit with parentId when selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Subcategoría');
    await user.selectOptions(
      screen.getByLabelText('Categoría padre (opcional)'),
      'c1'
    );
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Subcategoría');
    expect(values.parentId).toBe('c1');
  });

  it('prefills the form in edit mode', () => {
    renderForm({
      initialValues: {
        name: 'Categoría Existente',
        parentId: 'c1',
      },
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Categoría Existente');
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });
});

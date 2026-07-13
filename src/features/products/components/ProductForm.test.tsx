import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductForm } from './ProductForm';

const references = {
  presentations: [{ id: 'p1', name: 'Litro' }],
  brands: [{ id: 'b1', name: 'Castrol' }],
  categories: [{ id: 'c1', name: 'Lubricantes' }],
};

const onSubmit = vi.fn();

const initialValues = {
  code: 'COD-001',
  name: 'Aceite 20W50',
  description: 'Descripción inicial',
  price: 25,
  presentationId: 'p1',
  brandId: 'b1',
  categoryId: 'c1',
  barcode: '123456',
  taxRate: 21,
  notes: 'Notas iniciales',
  isActive: true,
};

describe('ProductForm', () => {
  beforeEach(() => {
    onSubmit.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderForm() {
    return render(
      <MemoryRouter>
        <ProductForm
          onSubmit={onSubmit}
          presentations={references.presentations}
          brands={references.brands}
          categories={references.categories}
        />
      </MemoryRouter>
    );
  }

  function renderEditForm() {
    return render(
      <MemoryRouter>
        <ProductForm
          onSubmit={onSubmit}
          presentations={references.presentations}
          brands={references.brands}
          categories={references.categories}
          initialValues={initialValues}
        />
      </MemoryRouter>
    );
  }

  it('renders all required fields and submit button', () => {
    renderForm();

    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de barras')).toBeInTheDocument();
    expect(screen.getByLabelText('Presentación')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Tasa de impuesto (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear producto' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute(
      'href',
      '/products'
    );
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => {
      expect(screen.getByText('El código es requerido')).toBeInTheDocument();
    });
    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    expect(
      screen.getByText('El precio debe ser mayor a 0')
    ).toBeInTheDocument();
    expect(
      screen.getByText('La presentación es requerida')
    ).toBeInTheDocument();
    expect(screen.getByText('La marca es requerida')).toBeInTheDocument();
    expect(screen.getByText('La categoría es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid values', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Código'), 'COD-001');
    await user.type(screen.getByLabelText('Nombre'), 'Aceite 20W50');
    await user.type(screen.getByLabelText('Precio'), '25');
    await user.selectOptions(screen.getByLabelText('Presentación'), 'p1');
    await user.selectOptions(screen.getByLabelText('Marca'), 'b1');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'c1');

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COD-001',
          name: 'Aceite 20W50',
          price: 25,
          presentationId: 'p1',
          brandId: 'b1',
          categoryId: 'c1',
          isActive: true,
        }),
        null
      );
    });
  });

  it('shows edit mode submit button', () => {
    renderEditForm();

    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('prefills fields with initial values in edit mode', () => {
    renderEditForm();

    expect(screen.getByLabelText('Código')).toHaveValue(initialValues.code);
    expect(screen.getByLabelText('Nombre')).toHaveValue(initialValues.name);
    expect(screen.getByLabelText('Precio')).toHaveValue(initialValues.price);
    expect(screen.getByLabelText('Presentación')).toHaveValue(
      initialValues.presentationId
    );
    expect(screen.getByLabelText('Marca')).toHaveValue(initialValues.brandId);
    expect(screen.getByLabelText('Categoría')).toHaveValue(
      initialValues.categoryId
    );
  });
});

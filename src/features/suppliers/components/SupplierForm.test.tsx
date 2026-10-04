import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { SupplierFormValues } from '../types';
import { SupplierForm } from './SupplierForm';

function renderForm(
  props: {
    onSubmit?: () => void;
    initialValues?: SupplierFormValues;
  } = {}
) {
  return render(
    <MemoryRouter>
      <SupplierForm
        onSubmit={props.onSubmit ?? vi.fn()}
        initialValues={props.initialValues}
      />
    </MemoryRouter>
  );
}

describe('SupplierForm', () => {
  it('renders the form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeInTheDocument();
  });

  it('blocks submit with invalid name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'a'.repeat(101));
    await user.click(screen.getByRole('button', { name: 'Crear proveedor' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El nombre no puede tener más de 100 caracteres'
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit with invalid email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Proveedor');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Crear proveedor' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El email no es válido'
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Proveedor Ejemplo');
    await user.type(screen.getByLabelText('Teléfono'), '999888777');
    await user.type(screen.getByLabelText('Email'), 'proveedor@example.com');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Industrial 123');
    await user.click(screen.getByRole('button', { name: 'Crear proveedor' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Proveedor Ejemplo');
    expect(values.phone).toBe('999888777');
    expect(values.email).toBe('proveedor@example.com');
    expect(values.address).toBe('Av. Industrial 123');
    expect(values.isActive).toBe(true);
  });

  it('prefills the form in edit mode', () => {
    renderForm({
      initialValues: {
        name: 'Proveedor Existente',
        phone: '999111222',
        email: 'existente@proveedor.com',
        address: 'Calle 1',
        isActive: false,
      },
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Proveedor Existente');
    expect(screen.getByLabelText('Teléfono')).toHaveValue('999111222');
    expect(screen.getByLabelText('Email')).toHaveValue(
      'existente@proveedor.com'
    );
    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle 1');
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('shows isActive switch as checked by default in create mode', () => {
    renderForm();
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeChecked();
  });

  it('accepts optional empty fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Proveedor Mínimo');
    await user.click(screen.getByRole('button', { name: 'Crear proveedor' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Proveedor Mínimo');
    // phone/address: optional().or(z.literal('')) -> ''
    // email: preprocess('' -> undefined), optional().or(z.literal('')) -> undefined
    expect(values.phone).toBe('');
    expect(values.email).toBeUndefined();
    expect(values.address).toBe('');
    expect(values.isActive).toBe(true);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { BrandFormValues } from '../types';
import { BrandForm } from './BrandForm';

function renderForm(
  props: {
    onSubmit?: () => void;
    initialValues?: BrandFormValues;
  } = {}
) {
  return render(
    <MemoryRouter>
      <BrandForm
        onSubmit={props.onSubmit ?? vi.fn()}
        initialValues={props.initialValues}
      />
    </MemoryRouter>
  );
}

describe('BrandForm', () => {
  it('renders the form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear marca' })
    ).toBeInTheDocument();
  });

  it('blocks submit with invalid name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'a'.repeat(101));
    await user.click(screen.getByRole('button', { name: 'Crear marca' }));
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
    await user.type(screen.getByLabelText('Nombre'), 'Marca Ejemplo');
    await user.click(screen.getByRole('button', { name: 'Crear marca' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Marca Ejemplo');
  });

  it('prefills the form in edit mode', () => {
    renderForm({
      initialValues: {
        name: 'Marca Existente',
      },
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Marca Existente');
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });
});

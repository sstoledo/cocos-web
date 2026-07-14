import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { ClientFormValues } from '../types';
import { ClientForm } from './ClientForm';

function renderForm(
  props: {
    onSubmit?: () => void;
    initialValues?: ClientFormValues;
  } = {}
) {
  return render(
    <MemoryRouter>
      <ClientForm
        onSubmit={props.onSubmit ?? vi.fn()}
        initialValues={props.initialValues}
      />
    </MemoryRouter>
  );
}

describe('ClientForm', () => {
  it('renders the form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de identificación')).toBeInTheDocument();
    expect(screen.getByLabelText('Identificación')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
  });

  it('blocks submit with invalid identification', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Identificación'), '123');
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'DNI 8 dígitos o RUC 11 dígitos'
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Identificación'), '12345678');
    await user.type(screen.getByLabelText('Teléfono'), '999888777');
    await user.type(screen.getByLabelText('Email'), 'juan@example.com');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 123');
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Juan Pérez');
    expect(values.identification).toBe('12345678');
  });

  it('prefills the form in edit mode', () => {
    renderForm({
      initialValues: {
        name: 'Juan Pérez',
        identificationType: 'DNI',
        identification: '12345678',
        phone: '',
        email: '',
        address: '',
      },
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan Pérez');
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { PresentationFormValues } from '../types';
import { PresentationForm } from './PresentationForm';

function renderForm(
  props: {
    onSubmit?: () => void;
    initialValues?: PresentationFormValues;
  } = {}
) {
  return render(
    <MemoryRouter>
      <PresentationForm
        onSubmit={props.onSubmit ?? vi.fn()}
        initialValues={props.initialValues}
      />
    </MemoryRouter>
  );
}

describe('PresentationForm', () => {
  it('renders the form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear presentación' })
    ).toBeInTheDocument();
  });

  it('blocks submit with invalid name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Nombre'), 'a'.repeat(101));
    await user.click(
      screen.getByRole('button', { name: 'Crear presentación' })
    );
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
    await user.type(screen.getByLabelText('Nombre'), 'Presentación Ejemplo');
    await user.click(
      screen.getByRole('button', { name: 'Crear presentación' })
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(values.name).toBe('Presentación Ejemplo');
  });

  it('prefills the form in edit mode', () => {
    renderForm({
      initialValues: {
        name: 'Presentación Existente',
      },
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue(
      'Presentación Existente'
    );
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });
});

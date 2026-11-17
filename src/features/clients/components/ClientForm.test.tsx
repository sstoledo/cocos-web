import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClientFormValues } from '../types';
import { ClientForm } from './ClientForm';

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('autofills empty name and address from the SUNAT RUC lookup', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ruc: '20131312955',
          razonSocial: 'SUPERINTENDENCIA NACIONAL DE ADUANAS',
          direccion: 'AV. GARCILASO DE LA VEGA NRO. 1472',
          estado: 'ACTIVO',
          condicion: 'HABIDO',
        }),
    });

    renderForm();
    await user.selectOptions(
      screen.getByLabelText('Tipo de identificación'),
      'RUC'
    );
    await user.type(screen.getByLabelText('Identificación'), '20131312955');

    await waitFor(
      () =>
        expect(screen.getByLabelText('Nombre')).toHaveValue(
          'SUPERINTENDENCIA NACIONAL DE ADUANAS'
        ),
      { timeout: 3000 }
    );
    expect(screen.getByLabelText('Dirección')).toHaveValue(
      'AV. GARCILASO DE LA VEGA NRO. 1472'
    );
    expect(
      screen.getByText(/SUNAT: SUPERINTENDENCIA NACIONAL/)
    ).toHaveTextContent('ACTIVO · HABIDO');
  });

  it('never clobbers user input when autofilling from the RUC lookup', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ruc: '20131312955',
          razonSocial: 'SUPERINTENDENCIA NACIONAL DE ADUANAS',
          direccion: 'AV. GARCILASO DE LA VEGA NRO. 1472',
          estado: 'ACTIVO',
          condicion: 'HABIDO',
        }),
    });

    renderForm();
    await user.type(screen.getByLabelText('Nombre'), 'Mi Empresa');
    await user.selectOptions(
      screen.getByLabelText('Tipo de identificación'),
      'RUC'
    );
    await user.type(screen.getByLabelText('Identificación'), '20131312955');

    await waitFor(
      () => expect(screen.getByText(/SUNAT:/)).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getByLabelText('Nombre')).toHaveValue('Mi Empresa');
  });

  it('shows a non-blocking hint when the RUC is not found', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    renderForm();
    await user.selectOptions(
      screen.getByLabelText('Tipo de identificación'),
      'RUC'
    );
    await user.type(screen.getByLabelText('Identificación'), '20131312955');

    await waitFor(
      () =>
        expect(
          screen.getByText('RUC no encontrado en el padrón de SUNAT')
        ).toBeInTheDocument(),
      { timeout: 3000 }
    );
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

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { VehicleFormValues } from '../types';
import { VehicleForm } from './VehicleForm';

const baseValues: VehicleFormValues = {
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
};

function renderVehicleForm(props: {
  onSubmit?: (values: VehicleFormValues) => void;
  onCancel?: () => void;
  initialValues?: VehicleFormValues;
  isPending?: boolean;
}) {
  const onSubmit = props.onSubmit ?? vi.fn();
  const onCancel = props.onCancel;
  return render(
    <VehicleForm
      clientId="c1"
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialValues={props.initialValues}
      isPending={props.isPending}
    />
  );
}

describe('VehicleForm', () => {
  it('renders all fields and submit button', () => {
    renderVehicleForm({});

    expect(screen.getByLabelText('Placa')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByLabelText('Modelo')).toBeInTheDocument();
    expect(screen.getByLabelText('Año')).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear vehículo' })
    ).toBeInTheDocument();
  });

  it('submits with valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderVehicleForm({ onSubmit });

    await user.type(screen.getByLabelText('Placa'), 'ABC123');
    await user.type(screen.getByLabelText('Marca'), 'Toyota');
    await user.type(screen.getByLabelText('Modelo'), 'Corolla');
    await user.type(screen.getByLabelText('Año'), '2020');
    await user.type(screen.getByLabelText('Color'), 'Rojo');
    await user.type(screen.getByLabelText('Notas'), 'Mantenimiento al día');

    await user.click(screen.getByRole('button', { name: 'Crear vehículo' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    const submitted = onSubmit.mock.calls[0][0] as VehicleFormValues;
    expect(submitted.plate).toBe('ABC123');
    expect(submitted.brand).toBe('Toyota');
    expect(submitted.model).toBe('Corolla');
    expect(submitted.year).toBe(2020);
    expect(submitted.color).toBe('Rojo');
    expect(submitted.notes).toBe('Mantenimiento al día');
    expect(submitted.clientId).toBe('c1');
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderVehicleForm({ onSubmit });

    await user.click(screen.getByRole('button', { name: 'Crear vehículo' }));

    await waitFor(() => {
      expect(screen.getByText('La placa es requerida')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('prefills and shows edit button when initialValues are provided', async () => {
    renderVehicleForm({ initialValues: baseValues });

    expect(screen.getByDisplayValue('ABC-123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderVehicleForm({ onCancel });

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables the form while pending', () => {
    renderVehicleForm({ isPending: true });

    expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled();
  });
});

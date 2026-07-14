import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Vehicle } from '../types';
import { VehicleList } from './VehicleList';

const activeVehicle: Vehicle = {
  id: 'v1',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
  isActive: true,
};

const inactiveVehicle: Vehicle = {
  ...activeVehicle,
  id: 'v2',
  plate: 'XYZ-789',
  isActive: false,
};

function renderVehicleList(
  vehicles: Vehicle[],
  props?: {
    canEdit?: boolean;
    onEdit?: (vehicle: Vehicle) => void;
    onDelete?: (vehicle: Vehicle) => void;
  }
) {
  return render(
    <VehicleList
      vehicles={vehicles}
      canEdit={props?.canEdit}
      onEdit={props?.onEdit}
      onDelete={props?.onDelete}
    />
  );
}

describe('VehicleList', () => {
  it('renders active vehicle data', () => {
    renderVehicleList([activeVehicle]);

    expect(screen.getByRole('cell', { name: 'ABC-123' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Toyota' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Corolla' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2020' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Rojo' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Mantenimiento al día' })
    ).toBeInTheDocument();
  });

  it('renders default values for optional fields', () => {
    renderVehicleList([
      {
        ...activeVehicle,
        year: undefined,
        color: undefined,
        notes: undefined,
      },
    ]);

    const cells = screen.getAllByRole('cell');
    expect(cells[3]).toHaveTextContent('—');
    expect(cells[4]).toHaveTextContent('—');
    expect(cells[5]).toHaveTextContent('—');
  });

  it('does not render soft-deleted vehicles', () => {
    renderVehicleList([activeVehicle, inactiveVehicle]);

    expect(screen.getByRole('cell', { name: 'ABC-123' })).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'XYZ-789' })
    ).not.toBeInTheDocument();
  });

  it('shows an empty message when there are no vehicles', () => {
    renderVehicleList([]);

    expect(
      screen.getByText('No se encontraron vehículos.')
    ).toBeInTheDocument();
  });

  it('hides action buttons when canEdit is false', () => {
    renderVehicleList([activeVehicle]);

    expect(
      screen.queryByRole('button', { name: 'Editar ABC-123' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Eliminar ABC-123' })
    ).not.toBeInTheDocument();
  });

  it('renders edit and delete buttons when canEdit is true', () => {
    renderVehicleList([activeVehicle], { canEdit: true });

    expect(
      screen.getByRole('button', { name: 'Editar ABC-123' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar ABC-123' })
    ).toBeInTheDocument();
  });

  it('calls onEdit and onDelete when buttons are clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderVehicleList([activeVehicle], {
      canEdit: true,
      onEdit,
      onDelete,
    });

    await user.click(screen.getByRole('button', { name: 'Editar ABC-123' }));
    expect(onEdit).toHaveBeenCalledWith(activeVehicle);

    await user.click(screen.getByRole('button', { name: 'Eliminar ABC-123' }));
    expect(onDelete).toHaveBeenCalledWith(activeVehicle);
  });
});

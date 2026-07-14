import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

function renderVehicleList(vehicles: Vehicle[]) {
  return render(<VehicleList vehicles={vehicles} />);
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
});

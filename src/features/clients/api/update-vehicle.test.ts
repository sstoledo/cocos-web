import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Vehicle, VehicleFormValues } from '../types';
import { updateVehicle } from './update-vehicle';

const id = 'v1';
const values: VehicleFormValues = {
  plate: 'ABC123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
};

const updatedVehicle: Vehicle = { id, ...values, isActive: true };

describe('updateVehicle', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a vehicle with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedVehicle,
    });

    const result = await updateVehicle(id, values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles/v1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(updatedVehicle);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(updateVehicle(id, values)).rejects.toThrow(
      'Failed to update vehicle: 404'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Vehicle, VehicleFormValues } from '../types';
import { createVehicle } from './create-vehicle';

const values: VehicleFormValues = {
  plate: 'ABC123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
};

const createdVehicle: Vehicle = {
  id: 'v1',
  ...values,
  isActive: true,
};

describe('createVehicle', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a vehicle with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdVehicle,
    });

    const result = await createVehicle(values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(createdVehicle);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
    });

    await expect(createVehicle(values)).rejects.toThrow(
      'Failed to create vehicle: 409'
    );
  });
});

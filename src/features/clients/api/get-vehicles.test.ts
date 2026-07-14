import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Vehicle } from '../types';
import { getVehicles } from './get-vehicles';

const vehicle: Vehicle = {
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

const paginatedResponse = {
  data: [vehicle],
  meta: { page: 1, total: 1, totalPages: 1 },
};

describe('getVehicles', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches paginated vehicles by clientId', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    const result = await getVehicles({ clientId: 'c1' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles?clientId=c1',
      { credentials: 'include' }
    );
    expect(result).toEqual(paginatedResponse);
  });

  it('builds the query string with pagination filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    await getVehicles({ clientId: 'c1', page: 2, limit: 10 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles?clientId=c1&page=2&limit=10',
      { credentials: 'include' }
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getVehicles({ clientId: 'c1' })).rejects.toThrow(
      'Failed to fetch vehicles: 404'
    );
  });
});

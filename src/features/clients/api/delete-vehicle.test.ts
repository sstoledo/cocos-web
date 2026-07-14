import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteVehicle } from './delete-vehicle';

describe('deleteVehicle', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a vehicle by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await deleteVehicle('v1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles/v1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      })
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(deleteVehicle('v1')).rejects.toThrow(
      'Failed to delete vehicle: 404'
    );
  });
});

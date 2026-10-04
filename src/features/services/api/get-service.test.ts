import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { getService } from './get-service';

const service: Service = {
  id: 'srv-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  price: '150.00',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a single service by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => service,
    });

    const result = await getService('srv-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services/srv-1',
      { credentials: 'include' }
    );
    expect(result).toEqual(service);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getService('srv-1')).rejects.toThrow(
      'Failed to fetch service: 404'
    );
  });
});

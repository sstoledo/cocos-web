import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { getServices } from './get-services';

const service: Service = {
  id: 's1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  price: '150.00',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getServices', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches services without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [service],
    });

    const result = await getServices({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services',
      { credentials: 'include' }
    );
    expect(result).toEqual([service]);
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [service],
    });

    await getServices({ q: 'aceite', isActive: true });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services?q=aceite&isActive=true',
      { credentials: 'include' }
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getServices({})).rejects.toThrow(
      'Failed to fetch services: 500'
    );
  });
});

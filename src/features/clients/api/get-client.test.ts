import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { getClient } from './get-client';

const client: Client = {
  id: 'c1',
  name: 'Juan Pérez',
  identification: '12345678',
  identificationType: 'DNI',
  phone: '999888777',
  email: 'juan@example.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a client by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => client,
    });

    const result = await getClient('c1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients/c1',
      { credentials: 'include' }
    );
    expect(result).toEqual(client);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getClient('c1')).rejects.toThrow(
      'Failed to fetch client: 404'
    );
  });
});

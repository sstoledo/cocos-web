import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { getClients } from './get-clients';

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

const paginatedResponse = {
  data: [client],
  meta: { page: 1, total: 1, totalPages: 1 },
};

describe('getClients', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches paginated clients without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    const result = await getClients({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients',
      { credentials: 'include' }
    );
    expect(result).toEqual(paginatedResponse);
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    await getClients({ query: 'juan', page: 2, limit: 10 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients?query=juan&page=2&limit=10',
      { credentials: 'include' }
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getClients({})).rejects.toThrow(
      'Failed to fetch clients: 500'
    );
  });
});

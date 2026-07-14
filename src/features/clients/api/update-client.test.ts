import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { updateClient } from './update-client';

const id = 'c1';

const values = {
  name: 'Juan Pérez',
  identificationType: 'DNI' as const,
  identification: '12345678',
  phone: '999888777',
  email: 'juan@example.com',
  address: 'Av. Principal 123',
};

const updatedClient: Client = {
  id,
  ...values,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('updateClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a client with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedClient,
    });

    const result = await updateClient(id, values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients/c1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body).toEqual(values);
    expect(result).toEqual(updatedClient);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
    });

    await expect(updateClient(id, values)).rejects.toThrow(
      'Failed to update client: 409'
    );
  });
});

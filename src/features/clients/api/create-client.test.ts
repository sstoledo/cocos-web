import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import { createClient } from './create-client';

const values = {
  name: 'Juan Pérez',
  identificationType: 'DNI' as const,
  identification: '12345678',
  phone: '999888777',
  email: 'juan@example.com',
  address: 'Av. Principal 123',
};

const createdClient: Client = {
  id: 'c1',
  ...values,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('createClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a client with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdClient,
    });

    const result = await createClient(values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/clients',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body).toEqual(values);
    expect(result).toEqual(createdClient);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
    });

    await expect(createClient(values)).rejects.toThrow(
      'Failed to create client: 422'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { createUser } from './create-user';

const createdUser: User = {
  id: 'u1',
  name: 'Nuevo Mecánico',
  email: 'nuevo@example.com',
  isActive: true,
  role: { id: 'clx123', name: 'Mechanic' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const payload = {
  email: 'nuevo@example.com',
  name: 'Nuevo Mecánico',
  password: 'secret123',
  roleId: 'clx123',
};

describe('createUser', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a user and returns the result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdUser,
    });

    const result = await createUser(payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    expect(result).toEqual(createdUser);
  });

  it('falls back to the status message when the body has no message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await expect(createUser(payload)).rejects.toThrow(
      'Failed to create user: 400'
    );
  });

  it('throws the message returned by the server', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'El correo ya está registrado' }),
    });

    await expect(createUser(payload)).rejects.toThrow(
      'El correo ya está registrado'
    );
  });
});

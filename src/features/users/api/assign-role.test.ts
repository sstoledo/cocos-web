import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { assignRole } from './assign-role';

const assignedUser: User = {
  id: 'u1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  isActive: true,
  role: { id: 'role-2', name: 'Admin' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const payload = { roleId: 'role-2' };

describe('assignRole', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('assigns a role to a user and returns the result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => assignedUser,
    });

    const result = await assignRole('u1', payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1/role',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    expect(result).toEqual(assignedUser);
  });

  it('falls back to the status message when the body has no message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(assignRole('u1', payload)).rejects.toThrow(
      'Failed to assign role: 404'
    );
  });

  it('throws the message returned by the server', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Rol inválido' }),
    });

    await expect(assignRole('u1', payload)).rejects.toThrow('Rol inválido');
  });
});

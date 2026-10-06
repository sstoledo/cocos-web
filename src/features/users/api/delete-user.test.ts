import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { deleteUser } from './delete-user';

const deletedUser: User = {
  id: 'u1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  isActive: false,
  role: { id: 'role-1', name: 'ReadOnly' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

describe('deleteUser', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes a user by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => deletedUser,
    });

    const result = await deleteUser('u1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1',
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
    expect(result).toEqual(deletedUser);
  });

  it('falls back to the status message when the body has no message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(deleteUser('u1')).rejects.toThrow(
      'Failed to delete user: 404'
    );
  });

  it('throws the message returned by the server', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'No se puede eliminar el usuario' }),
    });

    await expect(deleteUser('u1')).rejects.toThrow(
      'No se puede eliminar el usuario'
    );
  });
});

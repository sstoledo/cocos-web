import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { updateUser } from './update-user';

const updatedUser: User = {
  id: 'u1',
  name: 'Ana García',
  email: 'ana@example.com',
  isActive: true,
  role: { id: 'r1', name: 'Admin' },
  employeeId: 'emp-1',
  employee: { id: 'emp-1', name: 'Juan Pérez' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('updateUser', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends employeeId when linking an employee', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedUser,
    });

    const result = await updateUser('u1', { employeeId: 'emp-1' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: 'emp-1' }),
      }
    );
    expect(result).toEqual(updatedUser);
  });

  it('sends employeeId null when unlinking an employee', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...updatedUser, employeeId: null, employee: null }),
    });

    await updateUser('u1', { employeeId: null });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: null }),
      }
    );
  });
});

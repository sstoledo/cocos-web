import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User, UserListResponse } from '../types';
import { getUsers } from './get-users';

const mockUser: User = {
  id: 'u1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  isActive: true,
  role: { id: 'role-1', name: 'Mechanic' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const listResponse: UserListResponse = {
  data: [mockUser],
  meta: { page: 1, limit: 20, total: 1 },
};

describe('getUsers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches users without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const result = await getUsers({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?page=1&limit=20',
      { credentials: 'include' }
    );
    expect(result).toEqual(listResponse);
  });

  it('builds the query string with every filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getUsers({
      q: 'juan',
      roleId: 'clx123',
      isActive: 'true',
      page: 2,
      limit: 10,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?q=juan&roleId=clx123&isActive=true&page=2&limit=10',
      { credentials: 'include' }
    );
  });

  it('omits absent optional filters from the query string', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getUsers({ page: 2 });

    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;

    expect(url).toBe('http://localhost:3000/api/users?page=2&limit=20');
    expect(url).not.toContain('q=');
    expect(url).not.toContain('roleId=');
    expect(url).not.toContain('isActive=');
  });

  it('applies default pagination when page and limit are omitted', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getUsers();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?page=1&limit=20',
      { credentials: 'include' }
    );
  });

  it('sends isActive=false as an explicit filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getUsers({ isActive: 'false' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?isActive=false&page=1&limit=20',
      { credentials: 'include' }
    );
  });

  it('encodes special characters in the search term', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getUsers({ q: 'Pérez & Sons' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?q=P%C3%A9rez+%26+Sons&page=1&limit=20',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getUsers({})).rejects.toThrow('Failed to fetch users: 500');
  });
});

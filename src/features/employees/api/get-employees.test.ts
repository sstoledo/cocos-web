import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Employee } from '../types';
import { getEmployees } from './get-employees';

const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Ana Gómez', specialty: 'Mecánica', userId: 'u1' },
  { id: 'e2', name: 'Luis Pérez', specialty: null, userId: null },
];

describe('getEmployees', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches employees', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees,
    });

    const result = await getEmployees();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockEmployees);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getEmployees()).rejects.toThrow(
      'Failed to fetch employees: 500'
    );
  });
});

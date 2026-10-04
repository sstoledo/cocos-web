import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../types';
import { getSupplier } from './get-supplier';

const mockSupplier: Supplier = {
  id: 's1',
  name: 'Proveedor 1',
  phone: '999111222',
  email: 'p1@example.com',
  address: 'Calle 1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a supplier by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSupplier,
    });

    const result = await getSupplier('s1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers/s1',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockSupplier);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getSupplier('s1')).rejects.toThrow(
      'Failed to fetch supplier: 404'
    );
  });
});

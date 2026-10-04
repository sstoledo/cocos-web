import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier, SupplierListFilters } from '../types';
import { getSuppliers } from './get-suppliers';

const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'Proveedor 1',
    phone: '999111222',
    email: 'p1@example.com',
    address: 'Calle 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    name: 'Proveedor 2',
    phone: null,
    email: null,
    address: null,
    isActive: false,
    deletedAt: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('getSuppliers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches suppliers without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const result = await getSuppliers({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers',
      { credentials: 'include' }
    );
    expect(result).toEqual(mockSuppliers);
  });

  it('fetches suppliers with query filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const filters: SupplierListFilters = { q: 'Proveedor' };
    await getSuppliers(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers?q=Proveedor',
      { credentials: 'include' }
    );
  });

  it('fetches suppliers with isActive filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const filters: SupplierListFilters = { isActive: true };
    await getSuppliers(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers?isActive=true',
      { credentials: 'include' }
    );
  });

  it('fetches suppliers with combined filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuppliers,
    });

    const filters: SupplierListFilters = { q: 'Proveedor', isActive: true };
    await getSuppliers(filters);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers?q=Proveedor&isActive=true',
      { credentials: 'include' }
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getSuppliers({})).rejects.toThrow(
      'Failed to fetch suppliers: 500'
    );
  });
});

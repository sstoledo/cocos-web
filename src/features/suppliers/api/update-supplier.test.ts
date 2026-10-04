import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier, SupplierFormValues } from '../types';
import { updateSupplier } from './update-supplier';

const values: Partial<SupplierFormValues> = {
  name: 'Proveedor Actualizado',
  phone: '999333444',
};

const updatedSupplier: Supplier = {
  id: 's1',
  name: 'Proveedor Actualizado',
  phone: '999333444',
  email: 'p1@example.com',
  address: 'Calle 1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('updateSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a supplier and returns the result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedSupplier,
    });

    const result = await updateSupplier('s1', values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers/s1',
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }
    );
    expect(result).toEqual(updatedSupplier);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(updateSupplier('s1', values)).rejects.toThrow(
      'Failed to update supplier: 404'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier, SupplierFormValues } from '../types';
import { createSupplier } from './create-supplier';

const values: SupplierFormValues = {
  name: 'Nuevo Proveedor',
  phone: '999111222',
  email: 'nuevo@proveedor.com',
  address: 'Calle Nueva 123',
  isActive: true,
};

const createdSupplier: Supplier = {
  id: 's1',
  ...values,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('createSupplier', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a supplier and returns the result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdSupplier,
    });

    const result = await createSupplier(values);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/suppliers',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }
    );
    expect(result).toEqual(createdSupplier);
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(createSupplier(values)).rejects.toThrow(
      'Failed to create supplier: 400'
    );
  });
});

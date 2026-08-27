import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrder } from '../types';
import { getWorkOrder } from './get-work-order';

const workOrder: WorkOrder = {
  id: 'wo1',
  orderNumber: 'OC-2026-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
  description: null,
  status: 'in_progress',
  totalAmount: '15000.00',
  isActive: true,
  employee: { id: 'e1', name: 'Carlos Ruiz' },
  branch: { id: 'b1', name: 'Sucursal Centro' },
  services: [],
  products: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('getWorkOrder', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches a work order by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => workOrder,
    });

    const result = await getWorkOrder('wo1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders/wo1',
      { credentials: 'include' }
    );
    expect(result).toEqual(workOrder);
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getWorkOrder('unknown')).rejects.toThrow(
      'Failed to fetch work order: 404'
    );
  });
});

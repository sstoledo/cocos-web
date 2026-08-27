import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkOrder, WorkOrderListResponse } from '../types';
import { getWorkOrders } from './get-work-orders';

const workOrder: WorkOrder = {
  id: 'wo1',
  orderNumber: 'OC-2026-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
  description: null,
  status: 'pending',
  totalAmount: '15000.00',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  products: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const listResponse: WorkOrderListResponse = {
  data: [workOrder],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('getWorkOrders', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fetches work orders without filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    const result = await getWorkOrders({});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders',
      { credentials: 'include' }
    );
    expect(result).toEqual(listResponse);
  });

  it('builds the query string with filters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    });

    await getWorkOrders({ query: 'OC-2026', page: 2, limit: 10 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/work-orders?query=OC-2026&page=2&limit=10',
      { credentials: 'include' }
    );
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getWorkOrders({})).rejects.toThrow(
      'Failed to fetch work orders: 500'
    );
  });
});

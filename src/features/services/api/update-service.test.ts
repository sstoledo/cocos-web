import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { updateService } from './update-service';

const service: Service = {
  id: 'srv-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: '150.00',
  estimatedDuration: 30,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const formValues = {
  code: 'SRV-001',
  name: 'Cambio de aceite y filtro',
  description: 'Cambio de aceite, filtro y revisión',
  price: 180,
  estimatedDuration: 45,
  isActive: true,
};

describe('updateService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates a service with all fields', async () => {
    const updatedService = { ...service, ...formValues, price: '180.00' };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedService,
    });

    const result = await updateService('srv-1', formValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services/srv-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.name).toBe(formValues.name);
    expect(body.description).toBe(formValues.description);
    expect(body.price).toBe(formValues.price);
    expect(body.estimatedDuration).toBe(formValues.estimatedDuration);
    expect(result).toEqual(updatedService);
  });

  it('updates a service with partial fields', async () => {
    const partialValues = { name: 'Nuevo nombre', price: 200 };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...service, ...partialValues, price: '200.00' }),
    });

    const result = await updateService('srv-1', partialValues);

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.name).toBe('Nuevo nombre');
    expect(body.price).toBe(200);
    expect(body.code).toBeUndefined();
    expect(body.description).toBeUndefined();
    expect(body.estimatedDuration).toBeUndefined();
    expect(result.name).toBe('Nuevo nombre');
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(updateService('srv-1', formValues)).rejects.toThrow(
      'Failed to update service: 404'
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { createService } from './create-service';

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
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: 150,
  estimatedDuration: 30,
  isActive: true,
};

describe('createService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a service with all fields', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => service,
    });

    const result = await createService(formValues);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.code).toBe(formValues.code);
    expect(body.name).toBe(formValues.name);
    expect(body.description).toBe(formValues.description);
    expect(body.price).toBe(formValues.price);
    expect(body.estimatedDuration).toBe(formValues.estimatedDuration);
    expect(body.isActive).toBe(formValues.isActive);
    expect(result).toEqual(service);
  });

  it('creates a service with optional fields omitted', async () => {
    const minimalValues = {
      code: 'SRV-002',
      name: 'Lavado',
      price: 50,
      isActive: true,
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...service, ...minimalValues, id: 'srv-2' }),
    });

    const result = await createService(minimalValues);

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body.description).toBeUndefined();
    expect(body.estimatedDuration).toBeUndefined();
    expect(result.code).toBe('SRV-002');
  });

  it('throws when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(createService(formValues)).rejects.toThrow(
      'Failed to create service: 500'
    );
  });
});

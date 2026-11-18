import { ApiError } from '@/lib/api-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmissionResult } from '../../sunat/types';
import { emitSale } from './emit-sale';

describe('emitSale', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('posts /sales/:id/emit with credentials and returns the emission result', async () => {
    const result: EmissionResult = {
      serie: 'B001',
      correlativo: 1,
      sunatStatus: 'accepted',
      description: 'La Boleta numero B001-1, ha sido aceptada',
    };
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => result,
    });

    const response = await emitSale('sale1');

    expect(response).toEqual(result);
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('http://localhost:3000/api/sales/sale1/emit');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
  });

  it('surfaces the backend message when SUNAT configuration is missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'La emisión de comprobantes no está configurada',
      }),
    });

    const error = await emitSale('sale1').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(503);
    expect((error as ApiError).message).toContain('no está configurada');
  });

  it('propagates SUNAT rejection messages from the CDR', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({
        errorCode: 'BAD_GATEWAY',
        message:
          '2385: Error: La serie o numero del comprobante ya fue enviado anteriormente',
      }),
    });

    const error = await emitSale('sale1').catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).message).toContain('2385');
  });
});

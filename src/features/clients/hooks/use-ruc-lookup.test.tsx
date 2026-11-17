import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRucLookup } from './use-ruc-lookup';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRucLookup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('looks up a valid RUC and reports the found result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ruc: '20131312955',
          razonSocial: 'SUPERINTENDENCIA NACIONAL...',
          direccion: 'AV. GARCILASO DE LA VEGA NRO. 1472',
          estado: 'ACTIVO',
          condicion: 'HABIDO',
        }),
    });

    const { result, rerender } = renderHook(
      ({ type, value }: { type: string; value: string }) =>
        useRucLookup(type, value),
      { wrapper, initialProps: { type: 'DNI', value: '12345678' } }
    );

    rerender({ type: 'RUC', value: '20131312955' });
    await waitFor(() => expect(result.current.status).toBe('found'), {
      timeout: 3000,
    });
    expect(result.current.status === 'found' && result.current.result).toEqual(
      expect.objectContaining({ razonSocial: 'SUPERINTENDENCIA NACIONAL...' })
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/sunat/ruc/20131312955',
      { credentials: 'include' }
    );
  });

  it('does not look up invalid RUCs', async () => {
    globalThis.fetch = vi.fn();

    const { result } = renderHook(
      ({ type, value }: { type: string; value: string }) =>
        useRucLookup(type, value),
      { wrapper, initialProps: { type: 'RUC', value: '12345678901' } }
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(result.current.status).toBe('idle');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('does not re-fetch the same RUC', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ruc: '20131312955',
          razonSocial: 'X',
          direccion: null,
          estado: null,
          condicion: null,
        }),
    });

    const { rerender } = renderHook(
      ({ type, value }: { type: string; value: string }) =>
        useRucLookup(type, value),
      { wrapper, initialProps: { type: 'RUC', value: '20131312955' } }
    );

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    rerender({ type: 'RUC', value: '20131312955' });
    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('reports a non-blocking error when the RUC is not found', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const { result } = renderHook(() => useRucLookup('RUC', '20131312955'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('error'), {
      timeout: 3000,
    });
    expect(
      result.current.status === 'error' && result.current.message
    ).toContain('no encontrado');
  });
});

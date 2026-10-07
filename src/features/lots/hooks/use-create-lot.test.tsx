import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lot, LotFormValues } from '../types';
import { useCreateLot } from './use-create-lot';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const values: LotFormValues = {
  lotNumber: 'L-001',
  supplierId: 's1',
  receivedAt: new Date('2024-01-01T00:00:00.000Z'),
  notes: 'Lote inicial',
  items: [
    {
      productId: 'p1',
      quantity: 10,
      costPrice: 5.5,
      expirationDate: new Date('2025-01-01T00:00:00.000Z'),
    },
  ],
};

const createdLot: Lot = {
  id: 'l1',
  lotNumber: 'L-001',
  supplier: { id: 's1', name: 'Proveedor Uno' },
  receivedAt: '2024-01-01',
  notes: 'Lote inicial',
  items: [],
};

describe('useCreateLot', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('creates a lot', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdLot,
    });

    const { result } = renderHook(() => useCreateLot(), { wrapper });

    result.current.mutate(values);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSuccess).toBe(true);
    expect(toast.success).toHaveBeenCalledWith('Lote creado correctamente');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCreateLot(), { wrapper });

    result.current.mutate(values);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});

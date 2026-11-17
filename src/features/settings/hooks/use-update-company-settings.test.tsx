import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUpdateCompanySettings } from './use-update-company-settings';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useUpdateCompanySettings', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'settings-1',
          ruc: '20100070970',
          legalName: 'Cocos SAC',
          address: null,
          facturaSeries: 'F001',
          boletaSeries: 'B001',
          createdAt: '2026-11-16T00:00:00.000Z',
          updatedAt: '2026-11-16T00:00:00.000Z',
        }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('patches the settings and shows a success toast', async () => {
    const { result } = renderHook(() => useUpdateCompanySettings(), {
      wrapper,
    });

    result.current.mutate({ ruc: '20100070970' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/settings/company',
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Configuración de la empresa actualizada correctamente'
    );
  });

  it('does not show a success toast when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });

    const { result } = renderHook(() => useUpdateCompanySettings(), {
      wrapper,
    });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.success).not.toHaveBeenCalled();
  });
});

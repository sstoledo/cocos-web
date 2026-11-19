import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { SaleSunatAction } from './SaleSunatAction';

const adminUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const mechanicUser = { ...adminUser, role: { id: 'r3', name: 'Mechanic' } };

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

function setup(saleOverrides: Parameters<typeof buildSale>[0] = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SaleSunatAction sale={buildSale(saleOverrides)} />
    </QueryClientProvider>
  );
}

describe('SaleSunatAction', () => {
  beforeEach(() => {
    useUserMock.mockReturnValue({ user: adminUser });
  });

  afterEach(() => {
    useUserMock.mockReset();
    vi.restoreAllMocks();
  });

  it('renders the emit button for a pending completed sale with a document type', () => {
    setup({ documentType: 'boleta' });
    expect(
      screen.getByRole('button', { name: /emitir comprobante/i })
    ).toBeInTheDocument();
  });

  it('hides the action from non-authorized roles', () => {
    useUserMock.mockReturnValue({ user: mechanicUser });
    setup({ documentType: 'boleta' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render for a sale already accepted by SUNAT', () => {
    setup({
      documentType: 'boleta',
      sunatStatus: 'accepted',
      fiscalSeries: 'B001',
      fiscalNumber: 1,
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('sends the emission and shows the CDR result', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serie: 'B001',
        correlativo: 1,
        sunatStatus: 'accepted',
        description: 'La Boleta numero B001-1, ha sido aceptada',
      }),
    });

    setup({ documentType: 'boleta' });
    await user.click(
      screen.getByRole('button', { name: /emitir comprobante/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/ha sido aceptada/)).toBeInTheDocument()
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/sales\/.+\/emit$/),
      expect.anything()
    );
  });

  it('shows the CDR rejection text from SUNAT', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serie: 'B001',
        correlativo: 1,
        sunatStatus: 'rejected',
        description: 'La Boleta numero B001-1, ha sido rechazada',
      }),
    });

    setup({ documentType: 'boleta' });
    await user.click(
      screen.getByRole('button', { name: /emitir comprobante/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/ha sido rechazada/)).toBeInTheDocument()
    );
  });

  it('shows a clear error when emission is not configured (503)', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        message:
          'La emisión de comprobantes no está configurada (falta el certificado digital)',
      }),
    });

    setup({ documentType: 'boleta' });
    await user.click(
      screen.getByRole('button', { name: /emitir comprobante/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/no está configurada/)).toBeInTheDocument()
    );
  });
});

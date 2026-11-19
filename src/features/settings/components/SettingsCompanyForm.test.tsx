import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsCompanyForm } from './SettingsCompanyForm';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockSettings = {
  id: 'settings-1',
  ruc: null,
  legalName: null,
  address: null,
  ubigeo: null,
  facturaSeries: 'F001',
  boletaSeries: 'B001',
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
};

const MIRAFLORES = {
  code: '150122',
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/** Bodies of the PATCH calls to the settings endpoint. */
const patchBodies = () =>
  vi
    .mocked(globalThis.fetch)
    .mock.calls.filter(
      ([input, init]) =>
        String(input).includes('/settings/company') &&
        (init as RequestInit | undefined)?.method === 'PATCH'
    )
    .map(([, init]) => (init as RequestInit).body as string);

describe('SettingsCompanyForm', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/ubigeos/150122')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MIRAFLORES),
        });
      }

      if (url.includes('/ubigeos?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([MIRAFLORES]),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSettings),
      });
    }) as unknown as typeof fetch;
  });

  it('renders the fiscal fields with the current settings', () => {
    render(<SettingsCompanyForm settings={mockSettings} />, { wrapper });

    expect(screen.getByLabelText('RUC')).toBeInTheDocument();
    expect(screen.getByLabelText('Razón social')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Ubigeo del domicilio fiscal')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Serie de facturas')).toHaveValue('F001');
    expect(screen.getByLabelText('Serie de boletas')).toHaveValue('B001');
  });

  it('submits the fiscal values on save', async () => {
    const user = userEvent.setup();
    render(<SettingsCompanyForm settings={mockSettings} />, { wrapper });

    await user.type(screen.getByLabelText('RUC'), '20100070970');
    await user.type(screen.getByLabelText('Razón social'), 'Cocos SAC');
    await user.click(
      screen.getByRole('button', { name: 'Guardar configuración' })
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Configuración de la empresa actualizada correctamente'
      )
    );
    expect(patchBodies()[0]).toContain('"legalName":"Cocos SAC"');
  });

  it('sends the configured ubigeo untouched', async () => {
    const user = userEvent.setup();
    render(
      <SettingsCompanyForm settings={{ ...mockSettings, ubigeo: '150122' }} />,
      {
        wrapper,
      }
    );

    expect(
      await screen.findByDisplayValue('Miraflores, Lima, Lima (150122)')
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Razón social'), 'Cocos SAC');
    await user.click(
      screen.getByRole('button', { name: 'Guardar configuración' })
    );

    await waitFor(() => expect(patchBodies()).toHaveLength(1));
    expect(patchBodies()[0]).toContain('"ubigeo":"150122"');
  });

  it('rejects an invalid RUC without submitting', async () => {
    const user = userEvent.setup();
    render(<SettingsCompanyForm settings={mockSettings} />, { wrapper });

    await user.type(screen.getByLabelText('RUC'), '12345678901');
    await user.type(screen.getByLabelText('Razón social'), 'Cocos SAC');
    await user.click(
      screen.getByRole('button', { name: 'Guardar configuración' })
    );

    await waitFor(() =>
      expect(screen.getByText(/dígito verificador válido/)).toBeInTheDocument()
    );
    expect(patchBodies()).toHaveLength(0);
  });
});

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
  facturaSeries: 'F001',
  boletaSeries: 'B001',
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('SettingsCompanyForm', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    });
  });

  it('renders the fiscal fields with the current settings', () => {
    render(<SettingsCompanyForm settings={mockSettings} />, { wrapper });

    expect(screen.getByLabelText('RUC')).toBeInTheDocument();
    expect(screen.getByLabelText('Razón social')).toBeInTheDocument();
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
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/settings/company',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"legalName":"Cocos SAC"'),
      })
    );
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
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

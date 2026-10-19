import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LotForm } from './LotForm';

const supplier = { id: 's1', name: 'Proveedor A' };

const product = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 5W30',
  price: '25.00',
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const onSubmit = vi.fn();

function mockCatalogFetch() {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/suppliers')) {
      return {
        ok: true,
        json: async () => ({
          data: [supplier],
          meta: { page: 1, limit: 20, total: 1 },
        }),
      };
    }
    return {
      ok: true,
      json: async () => ({
        data: [product],
        meta: { page: 1, limit: 20, total: 1 },
      }),
    };
  });
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      null,
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  }

  return render(<LotForm onSubmit={onSubmit} />, { wrapper: Wrapper });
}

async function pickComboboxOption(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  optionName: string | RegExp
) {
  const input = screen.getByLabelText(label);
  await user.click(input);
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('LotForm', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    onSubmit.mockReset();
    mockCatalogFetch();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders all required fields and submit button', () => {
    renderForm();

    expect(screen.getByLabelText('Número de lote')).toBeInTheDocument();
    expect(screen.getByLabelText('Proveedor')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de recepción')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas')).toBeInTheDocument();
    expect(screen.getByLabelText('Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio de costo')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de vencimiento')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar ítem' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear lote' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute(
      'href',
      '/lots'
    );
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Crear lote' }));

    await waitFor(() => {
      expect(
        screen.getByText('El número de lote es requerido')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('El proveedor es requerido')).toBeInTheDocument();
    expect(
      screen.getByText('La fecha de recepción es requerida')
    ).toBeInTheDocument();
    expect(screen.getByText('El producto es requerido')).toBeInTheDocument();
    expect(
      screen.getByText('El precio de costo debe ser mayor a 0')
    ).toBeInTheDocument();
    expect(
      screen.getByText('La fecha de vencimiento es requerida')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid values', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Número de lote'), 'L-2026-001');
    await pickComboboxOption(user, 'Proveedor', 'Proveedor A');
    await user.type(screen.getByLabelText('Fecha de recepción'), '2026-07-13');
    await pickComboboxOption(user, 'Producto', 'Aceite 5W30');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '24');
    await user.type(screen.getByLabelText('Precio de costo'), '12.50');
    await user.type(
      screen.getByLabelText('Fecha de vencimiento'),
      '2027-01-01'
    );

    await user.click(screen.getByRole('button', { name: 'Crear lote' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          lotNumber: 'L-2026-001',
          supplierId: 's1',
          notes: '',
          items: [
            expect.objectContaining({
              productId: 'p1',
              quantity: 24,
              costPrice: 12.5,
            }),
          ],
        })
      );
    });
  });

  it('adds and removes line items', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getAllByLabelText('Producto')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Agregar ítem' }));

    expect(screen.getAllByLabelText('Producto')).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

    expect(screen.getAllByLabelText('Producto')).toHaveLength(1);
  });
});

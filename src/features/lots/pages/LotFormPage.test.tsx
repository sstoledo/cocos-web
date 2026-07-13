import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LotFormPage } from './LotFormPage';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/lots/new'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/lots/new',
            element: children,
          }),
          createElement(Route, {
            path: '/lots',
            element: createElement(LocationDisplay),
          })
        )
      )
    );
  };
}

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

const suppliers = [{ id: 's1', name: 'Proveedor A' }];

const products = [
  {
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
  },
];

const createdLot = {
  id: 'lot-1',
  lotNumber: 'L-2026-001',
  supplier: { id: 's1', name: 'Proveedor A' },
  receivedAt: '2026-07-13T00:00:00.000Z',
  notes: '',
  items: [
    {
      id: 'i1',
      product: { id: 'p1', name: 'Aceite 5W30' },
      quantity: 24,
      remainingQuantity: 24,
      costPrice: '12.50',
      expirationDate: '2027-01-01T00:00:00.000Z',
    },
  ],
};

function mockFetch() {
  return vi.fn((url: string) => {
    if (url === 'http://localhost:3000/api/suppliers') {
      return Promise.resolve({
        ok: true,
        json: async () => suppliers,
      });
    }

    if (url === 'http://localhost:3000/api/products') {
      return Promise.resolve({
        ok: true,
        json: async () => products,
      });
    }

    if (url === 'http://localhost:3000/api/lots') {
      return Promise.resolve({
        ok: true,
        json: async () => createdLot,
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
    });
  }) as unknown as typeof fetch;
}

describe('LotFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the page title and loading state', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<LotFormPage />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole('heading', { name: 'Nuevo lote' })
    ).toBeInTheDocument();
    expect(screen.getByText('Cargando catálogos…')).toBeInTheDocument();
  });

  it('shows an error when catalogs fail to load', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<LotFormPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los catálogos'
      )
    );
  });

  it('submits the form and navigates to the lot list', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<LotFormPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Número de lote')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Número de lote'), 'L-2026-001');
    await user.selectOptions(screen.getByLabelText('Proveedor'), 's1');
    await user.type(screen.getByLabelText('Fecha de recepción'), '2026-07-13');

    await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '24');
    await user.type(screen.getByLabelText('Precio de costo'), '12.50');
    await user.type(
      screen.getByLabelText('Fecha de vencimiento'),
      '2027-01-01'
    );

    await user.click(screen.getByRole('button', { name: 'Crear lote' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/lots',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const lotCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === 'http://localhost:3000/api/lots' &&
        (call[1] as RequestInit).method === 'POST'
    );
    const requestInit = lotCall?.[1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);

    expect(body).toEqual({
      lotNumber: 'L-2026-001',
      supplierId: 's1',
      receivedAt: '2026-07-13',
      notes: '',
      items: [
        {
          productId: 'p1',
          quantity: 24,
          costPrice: 12.5,
          expirationDate: '2027-01-01',
        },
      ],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/lots')
    );
  });
});

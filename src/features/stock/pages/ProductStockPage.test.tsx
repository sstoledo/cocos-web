import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductStockPage } from './ProductStockPage';

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
      { initialEntries: ['/products/prod-1/stock'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/products/:id/stock',
            element: children,
          })
        )
      )
    );
  };
}

const product = {
  id: 'prod-1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  isActive: true,
  presentation: { id: 'p1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const stock = {
  productId: 'prod-1',
  stock: 42,
};

const movements = [
  {
    id: 'm-1',
    type: 'adjustment',
    quantity: -2,
    reason: 'Ajuste por rotura',
    createdAt: '2026-07-13T12:00:00.000Z',
    lotItem: { lot: { lotNumber: 'L-001' } },
  },
];

const createdMovement = {
  id: 'm-2',
  type: 'adjustment',
  quantity: 5,
  reason: 'Ingreso de mercadería',
  createdAt: '2026-07-13T13:00:00.000Z',
};

function createFetchMock() {
  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url === 'http://localhost:3000/api/products/prod-1') {
      return Promise.resolve({
        ok: true,
        json: async () => product,
      });
    }

    if (url === 'http://localhost:3000/api/stock/products/prod-1') {
      return Promise.resolve({
        ok: true,
        json: async () => stock,
      });
    }

    if (url === 'http://localhost:3000/api/stock/products/prod-1/movements') {
      return Promise.resolve({
        ok: true,
        json: async () => movements,
      });
    }

    if (
      url === 'http://localhost:3000/api/stock/movements' &&
      init?.method === 'POST'
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => createdMovement,
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
    });
  });
}

describe('ProductStockPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the product name, stock, and movements', async () => {
    globalThis.fetch = createFetchMock();

    render(<ProductStockPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Aceite 20W50' })
      ).toBeInTheDocument()
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Ajuste por rotura' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'L-001' })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    globalThis.fetch = createFetchMock();

    render(<ProductStockPage />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows an error message when data fails to load', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<ProductStockPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });

  it('submits an adjustment and refreshes the data', async () => {
    const user = userEvent.setup();
    globalThis.fetch = createFetchMock();

    render(<ProductStockPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Cantidad')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Cantidad'), '5');
    await user.type(screen.getByLabelText('Motivo'), 'Ingreso de mercadería');
    await user.click(screen.getByRole('button', { name: 'Guardar ajuste' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/stock/movements',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const postCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === 'http://localhost:3000/api/stock/movements' &&
        (call[1] as RequestInit).method === 'POST'
    );
    const requestInit = postCall?.[1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body).toMatchObject({
      productId: 'prod-1',
      quantity: 5,
      reason: 'Ingreso de mercadería',
      type: 'adjustment',
    });

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Ajuste guardado correctamente'
      )
    );
  });
});

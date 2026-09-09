import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import type { Sale } from '../types';
import { SaleDetailPage } from './SaleDetailPage';

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

const adminUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const sale = buildSale();

function mockFetchWithSale(response: Sale) {
  return vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => adminUser };
    }
    return { ok: true, json: async () => response };
  });
}

function createWrapper(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries },
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  };
}

function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

function renderDetailPage() {
  return render(
    <Routes>
      <Route path="/sales/:id" element={<SaleDetailPage />} />
    </Routes>,
    { wrapper: createWrapper(['/sales/sale1']) }
  );
}

function renderGuardedDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/sales/sale1']}>
      <Routes>
        <Route
          path="/sales/:id"
          element={
            <RouteGuard
              routePath="/sales/:id"
              requiredRoles={['Admin', 'Reception']}
            >
              <SaleDetailPage />
            </RouteGuard>
          }
        />
        <Route path="/unauthorized" element={<div>Acceso denegado</div>} />
        <Route path="/login" element={<div>Iniciar sesión</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createQueryClientWrapper() }
  );
}

describe('SaleDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    useUserMock.mockReturnValue({
      user: adminUser,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    useUserMock.mockReset();
  });

  it('S6: renders product and service lines with snapshot and subtotal verbatim plus the total', async () => {
    globalThis.fetch = mockFetchWithSale(sale);

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Venta VTA-2026-000001' })
      ).toBeInTheDocument()
    );

    for (const column of ['Cantidad', 'Precio unitario', 'Subtotal']) {
      expect(
        screen.getAllByRole('columnheader', { name: column })
      ).toHaveLength(2);
    }
    expect(
      screen.getByRole('columnheader', { name: 'Producto' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Servicio' })
    ).toBeInTheDocument();

    // Backend money strings render verbatim (SL-NF2) — no recomputation.
    expect(
      screen.getByRole('cell', { name: 'Filtro de aceite' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    // Product line: unitPriceSnapshot 80.50 and subtotal 80.50.
    expect(screen.getAllByRole('cell', { name: '80.50' })).toHaveLength(2);
    expect(screen.getByRole('cell', { name: '300.00' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Cambio de aceite' })
    ).toBeInTheDocument();

    expect(screen.getByText('Total: 380.50')).toBeInTheDocument();
  });

  it('S7: renders client, branch and employee names, payment label, badge, VTA and date', async () => {
    globalThis.fetch = mockFetchWithSale(sale);

    renderDetailPage();

    await waitFor(() =>
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    );
    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument();
    expect(screen.getByText('María Gómez')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Venta VTA-2026-000001' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(new Date(sale.createdAt).toLocaleDateString('es-AR'))
    ).toBeInTheDocument();
  });

  it('S7: falls back to walk-in client label and em-dash for null branch and employee', async () => {
    globalThis.fetch = mockFetchWithSale(
      buildSale({
        client: null,
        clientId: null,
        branch: null,
        branchId: null,
        employee: null,
        employeeId: null,
      })
    );

    renderDetailPage();

    await waitFor(() =>
      expect(screen.getByText('Cliente ocasional')).toBeInTheDocument()
    );
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('shows a loading state while fetching', () => {
    globalThis.fetch = mockFetchWithSale(sale);

    renderDetailPage();

    expect(screen.getByText('Cargando venta…')).toBeInTheDocument();
  });

  it('S8: shows the not-found block with a return link when the sale is missing', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({
          message: 'Sale not found',
          errorCode: 'SALE_NOT_FOUND',
        }),
      };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByText('La venta no existe o fue eliminada.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a ventas' })
    ).toHaveAttribute('href', '/sales');
  });

  it('shows a denied view when the request is forbidden', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return { ok: false, status: 403, json: async () => ({}) };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByText('No tenés permiso para ver esta venta.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a ventas' })
    ).toHaveAttribute('href', '/sales');
  });

  it('shows a Spanish error state on other failures', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return { ok: false, status: 500, json: async () => ({}) };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });

  it('redirects a Mechanic to /unauthorized', async () => {
    useUserMock.mockReturnValue({
      user: {
        id: 'u2',
        name: 'Pedro',
        email: 'pedro@example.com',
        role: { id: 'r2', name: 'Mechanic' },
      },
      isLoading: false,
      error: null,
    });
    globalThis.fetch = mockFetchWithSale(sale);

    renderGuardedDetailPage();

    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Venta VTA-2026-000001' })
    ).not.toBeInTheDocument();
  });

  it('redirects a logged-out user to /login', async () => {
    useUserMock.mockReturnValue({ user: null, isLoading: false, error: null });
    globalThis.fetch = mockFetchWithSale(sale);

    renderGuardedDetailPage();

    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Venta VTA-2026-000001' })
    ).not.toBeInTheDocument();
  });
});

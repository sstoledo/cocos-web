import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../../sales/test/fixtures';
import type { SaleListResponse } from '../../sales/types';
import { RefundPage } from './RefundPage';

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

const cancelledSale = buildSale({ status: 'cancelled' });

const paginatedResponse: SaleListResponse = {
  data: [cancelledSale],
  meta: { page: 1, limit: 10, total: 1 },
};

const multiPageResponse: SaleListResponse = {
  data: [cancelledSale],
  meta: { page: 1, limit: 10, total: 25 },
};

function mockFetchWithSales(response: object) {
  return vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => adminUser };
    }
    return { ok: true, json: async () => response };
  });
}

function createWrapper(initialEntries?: string[]) {
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

function lastSalesUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  const salesCalls = fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes('/sales')
  );
  const [url] = salesCalls.at(-1) as [string];
  return new URL(url);
}

describe('RefundPage', () => {
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

  it('S8: renders the 7 standard columns querying only cancelled sales', async () => {
    const fetchMock = mockFetchWithSales(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'VTA-2026-000001' })
      ).toBeInTheDocument()
    );

    for (const column of [
      'N° Venta',
      'Fecha',
      'Cliente',
      'Método de pago',
      'Total',
      'Estado',
      'Acciones',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: column })
      ).toBeInTheDocument();
    }

    expect(screen.getByText('Cancelada')).toBeInTheDocument();
    expect(lastSalesUrl(fetchMock).searchParams.get('status')).toBe(
      'cancelled'
    );
  });

  it('shows a loading state and then the table', async () => {
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    expect(screen.getByText('Cargando ventas…')).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'VTA-2026-000001' })
      ).toBeInTheDocument()
    );
  });

  it('S8: shows the empty state when there are no cancelled sales', async () => {
    globalThis.fetch = mockFetchWithSales({
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    });

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    await waitFor(() =>
      expect(screen.getByText('No se encontraron ventas.')).toBeInTheDocument()
    );
  });

  it('S8: shows a Spanish error state when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return { ok: false, status: 500 };
    });

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar las ventas'
      )
    );
  });

  it('S8: paginates the cancelled sales and syncs the page to the URL', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithSales(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );
    expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('1');

    await testUser.click(
      screen.getByRole('button', { name: 'Página siguiente' })
    );

    await waitFor(() =>
      expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('2')
    );
  });

  it('S9: links each row to the sale detail page', async () => {
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(<RefundPage />, { wrapper: createWrapper(['/refunds']) });

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ver/i })).toHaveAttribute(
        'href',
        '/sales/sale1'
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
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(
      <MemoryRouter initialEntries={['/refunds']}>
        <Routes>
          <Route
            path="/refunds"
            element={
              <RouteGuard routePath="/refunds">
                <RefundPage />
              </RouteGuard>
            }
          />
          <Route path="/unauthorized" element={<div>Acceso denegado</div>} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createQueryClientWrapper() }
    );

    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Devoluciones' })
    ).not.toBeInTheDocument();
  });

  it('redirects a logged-out user to /login', async () => {
    useUserMock.mockReturnValue({ user: null, isLoading: false, error: null });
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(
      <MemoryRouter initialEntries={['/refunds']}>
        <Routes>
          <Route
            path="/refunds"
            element={
              <RouteGuard routePath="/refunds">
                <RefundPage />
              </RouteGuard>
            }
          />
          <Route path="/login" element={<div>Iniciar sesión</div>} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createQueryClientWrapper() }
    );

    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Devoluciones' })
    ).not.toBeInTheDocument();
  });
});

import { RouteGuard } from '@/features/shell/components/RouteGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import type { SaleListResponse } from '../types';
import { SalesListPage } from './SalesListPage';

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

const paginatedResponse: SaleListResponse = {
  data: [sale],
  meta: { page: 1, limit: 10, total: 1 },
};

const multiPageResponse: SaleListResponse = {
  data: [sale],
  meta: { page: 1, limit: 10, total: 25 },
};

const clientsResponse = {
  data: [{ id: 'c1', name: 'Juan Pérez', isActive: true }],
  meta: { page: 1, total: 1, totalPages: 1 },
};

function mockFetchWithSales(response: object) {
  return vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => adminUser };
    }
    if (url.includes('/clients')) {
      return { ok: true, json: async () => clientsResponse };
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

describe('SalesListPage', () => {
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

  it('S1: renders the table columns and the pagination control', async () => {
    globalThis.fetch = mockFetchWithSales(multiPageResponse);

    render(<SalesListPage />, { wrapper: createWrapper() });

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

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });

  it('shows a loading state and then the table', async () => {
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(<SalesListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando ventas…')).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'VTA-2026-000001' })
      ).toBeInTheDocument()
    );
  });

  it('S3: shows an empty state when there are no sales', async () => {
    globalThis.fetch = mockFetchWithSales({
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    });

    render(<SalesListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('No se encontraron ventas.')).toBeInTheDocument()
    );
  });

  it('S4: shows a Spanish error state when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      if (url.includes('/clients')) {
        return { ok: true, json: async () => clientsResponse };
      }
      return { ok: false, status: 500 };
    });

    render(<SalesListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar las ventas'
      )
    );
  });

  it('S2: syncs filters to the URL and sends them with end-of-day to', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithSales(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<SalesListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando ventas…')).not.toBeInTheDocument()
    );

    await testUser.type(
      screen.getByRole('searchbox', { name: 'Buscar ventas' }),
      'VTA-0001'
    );
    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2024-01-31' },
    });
    await testUser.selectOptions(
      screen.getByRole('combobox', { name: 'Cliente' }),
      'c1'
    );
    await testUser.selectOptions(
      screen.getByRole('combobox', { name: 'Estado' }),
      'completed'
    );

    await waitFor(() => {
      const url = lastSalesUrl(fetchMock);
      expect(url.searchParams.get('saleNumber')).toBe('VTA-0001');
      expect(url.searchParams.get('from')).toBe('2024-01-01T00:00:00.000');
      expect(url.searchParams.get('to')).toBe('2024-01-31T23:59:59.999');
      expect(url.searchParams.get('clientId')).toBe('c1');
      expect(url.searchParams.get('status')).toBe('completed');
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('S7: filters by cancelled status with URL sync and page reset', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithSales(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<SalesListPage />, {
      wrapper: createWrapper(['/sales?page=2']),
    });

    await waitFor(() =>
      expect(screen.queryByText('Cargando ventas…')).not.toBeInTheDocument()
    );
    expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('2');

    await testUser.selectOptions(
      screen.getByRole('combobox', { name: 'Estado' }),
      'cancelled'
    );

    await waitFor(() => {
      const url = lastSalesUrl(fetchMock);
      expect(url.searchParams.get('status')).toBe('cancelled');
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('resets the page to 1 when a filter changes', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithSales(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<SalesListPage />, {
      wrapper: createWrapper(['/sales?page=2']),
    });

    await waitFor(() =>
      expect(screen.queryByText('Cargando ventas…')).not.toBeInTheDocument()
    );
    expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('2');

    await testUser.type(
      screen.getByRole('searchbox', { name: 'Buscar ventas' }),
      'VTA'
    );

    await waitFor(() =>
      expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('1')
    );
  });

  it('reads initial filters from the URL', async () => {
    const fetchMock = mockFetchWithSales(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<SalesListPage />, {
      wrapper: createWrapper(['/sales?saleNumber=VTA-0001&page=2']),
    });

    expect(
      screen.getByRole('searchbox', { name: 'Buscar ventas' })
    ).toHaveValue('VTA-0001');

    await waitFor(() =>
      expect(lastSalesUrl(fetchMock).searchParams.get('saleNumber')).toBe(
        'VTA-0001'
      )
    );
    expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('2');
  });

  it('navigates to the next page', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithSales(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<SalesListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );

    await testUser.click(
      screen.getByRole('button', { name: 'Página siguiente' })
    );

    await waitFor(() =>
      expect(lastSalesUrl(fetchMock).searchParams.get('page')).toBe('2')
    );
  });

  it('S5: links each row to the sale detail', async () => {
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(<SalesListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ver/i })).toHaveAttribute(
        'href',
        '/sales/sale1'
      )
    );
  });

  it('SL-F10: links the header button to the checkout page', () => {
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(<SalesListPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /nueva venta/i })).toHaveAttribute(
      'href',
      '/sales/new'
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
      <MemoryRouter initialEntries={['/sales']}>
        <Routes>
          <Route
            path="/sales"
            element={
              <RouteGuard
                routePath="/sales"
                requiredRoles={['Admin', 'Reception']}
              >
                <SalesListPage />
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
      screen.queryByRole('heading', { name: 'Ventas' })
    ).not.toBeInTheDocument();
  });

  it('redirects a logged-out user to /login', async () => {
    useUserMock.mockReturnValue({ user: null, isLoading: false, error: null });
    globalThis.fetch = mockFetchWithSales(paginatedResponse);

    render(
      <MemoryRouter initialEntries={['/sales']}>
        <Routes>
          <Route
            path="/sales"
            element={
              <RouteGuard
                routePath="/sales"
                requiredRoles={['Admin', 'Reception']}
              >
                <SalesListPage />
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
      screen.queryByRole('heading', { name: 'Ventas' })
    ).not.toBeInTheDocument();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkOrderListPage } from './WorkOrderListPage';

const user = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const workOrder = {
  id: 'wo1',
  orderNumber: 'OT-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Ford', model: 'Fiesta' },
  description: 'Cambio de aceite',
  status: 'pending',
  totalAmount: '15000.00',
  isActive: true,
  employee: null,
  branch: null,
  services: [],
  products: [],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

const paginatedResponse = {
  data: [workOrder],
  meta: { page: 1, limit: 10, total: 1 },
};

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

function mockFetch(response: object) {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => user };
    }
    return { ok: true, json: async () => response };
  });
}

describe('WorkOrderListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header and filters', async () => {
    mockFetch(paginatedResponse);

    render(<WorkOrderListPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { name: 'Órdenes de trabajo' })
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('cell', { name: 'OT-0001' })).toBeInTheDocument()
    );

    expect(
      screen.getByRole('searchbox', { name: 'Buscar órdenes' })
    ).toBeInTheDocument();
  });

  it('shows a loading state and then the table', async () => {
    mockFetch(paginatedResponse);

    render(<WorkOrderListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando órdenes…')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('cell', { name: 'OT-0001' })).toBeInTheDocument()
    );
  });

  it('shows an error message when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user };
      }
      return { ok: false, status: 500 };
    });

    render(<WorkOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar las órdenes de trabajo'
      )
    );
  });

  it('shows an empty state when there are no work orders', async () => {
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

    render(<WorkOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByText('No se encontraron órdenes de trabajo.')
      ).toBeInTheDocument()
    );
  });

  it('syncs search and page to the URL', async () => {
    const testUser = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user };
      }
      return { ok: true, json: async () => paginatedResponse };
    });
    globalThis.fetch = fetchMock;

    render(<WorkOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando órdenes…')).not.toBeInTheDocument()
    );

    await testUser.type(screen.getByRole('searchbox'), 'OT-0001');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/work-orders?query=OT-0001&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('reads initial filters from the URL', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user };
      }
      return { ok: true, json: async () => paginatedResponse };
    });
    globalThis.fetch = fetchMock;

    render(<WorkOrderListPage />, {
      wrapper: createWrapper(['/work-orders?query=OT-0001&page=2']),
    });

    expect(screen.getByRole('searchbox')).toHaveValue('OT-0001');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/work-orders?query=OT-0001&page=2&limit=10',
        { credentials: 'include' }
      )
    );
  });
});

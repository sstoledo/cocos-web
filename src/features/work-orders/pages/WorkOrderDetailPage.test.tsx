import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkOrderDetailPage } from './WorkOrderDetailPage';

const workOrder = {
  id: 'wo1',
  orderNumber: 'OT-0001',
  clientId: 'c1',
  vehicleId: 'v1',
  client: { id: 'c1', name: 'Juan Pérez' },
  vehicle: { id: 'v1', plate: 'ABC123', brand: 'Ford', model: 'Fiesta' },
  description: 'Mantenimiento general',
  status: 'in_progress',
  totalAmount: '30500.50',
  isActive: true,
  employee: { id: 'e1', name: 'Pedro Gómez' },
  branch: { id: 'b1', name: 'Sucursal Centro' },
  services: [
    {
      id: 's1',
      serviceId: 'srv1',
      quantity: 2,
      unitPriceSnapshot: '5000.00',
      subtotal: '10000.00',
      service: {
        id: 'srv1',
        code: 'SRV-01',
        name: 'Cambio de aceite',
        description: null,
        price: '5000.00',
        estimatedDuration: null,
      },
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    },
  ],
  products: [
    {
      id: 'p1',
      productId: 'prod1',
      quantity: 2,
      unitPriceSnapshot: '20500.50',
      subtotal: '41001.00',
      product: {
        id: 'prod1',
        code: 'PRD-01',
        name: 'Filtro de aceite',
        description: null,
        price: '20500.50',
      },
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    },
  ],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-20T00:00:00.000Z',
};

function createWrapper(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/work-orders/:id', element: children })
        )
      )
    );
  };
}

function mockFetch(body: object, ok = true, status = 200) {
  globalThis.fetch = vi.fn().mockImplementation(async () => ({
    ok,
    status,
    json: async () => body,
  }));
}

function renderPage(path = '/work-orders/wo1') {
  return render(<WorkOrderDetailPage />, { wrapper: createWrapper(path) });
}

describe('WorkOrderDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header, general info and timestamps', async () => {
    mockFetch(workOrder);

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Orden OT-0001' })
      ).toBeInTheDocument()
    );

    expect(screen.getByText('En progreso')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText(/ABC123 · Ford Fiesta/)).toBeInTheDocument();
    expect(screen.getByText('Mantenimiento general')).toBeInTheDocument();
    expect(screen.getByText('Pedro Gómez')).toBeInTheDocument();
    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(workOrder.createdAt).toLocaleDateString('es-AR')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(workOrder.updatedAt).toLocaleDateString('es-AR')
      )
    ).toBeInTheDocument();
  });

  it('renders service and product line tables with string decimals verbatim', async () => {
    mockFetch(workOrder);

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Cambio de aceite' })
      ).toBeInTheDocument()
    );

    expect(
      screen.getByRole('cell', { name: 'Filtro de aceite' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '5000.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '10000.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '20500.50' })).toBeInTheDocument();
    expect(screen.getByText('Total: 30500.50')).toBeInTheDocument();
  });

  it('shows placeholders when optional fields are null', async () => {
    mockFetch({
      ...workOrder,
      description: null,
      employee: null,
      branch: null,
      services: [],
      products: [],
    });

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Orden OT-0001' })
      ).toBeInTheDocument()
    );

    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(screen.getByText('No hay servicios cargados.')).toBeInTheDocument();
    expect(screen.getByText('No hay productos cargados.')).toBeInTheDocument();
  });

  it('shows a loading state while fetching', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Cargando orden…')).toBeInTheDocument();
  });

  it('shows a not-found message with a link back when the order does not exist', async () => {
    mockFetch({ message: 'Not found' }, false, 404);

    renderPage('/work-orders/missing');

    await waitFor(() =>
      expect(
        screen.getByText('La orden no existe o fue eliminada.')
      ).toBeInTheDocument()
    );

    expect(
      screen.getByRole('link', { name: 'Volver a órdenes de trabajo' })
    ).toHaveAttribute('href', '/work-orders');
  });

  it('shows an error message when the request fails for other reasons', async () => {
    mockFetch({ message: 'Server error' }, false, 500);

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });
});

const adminUser = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@example.com',
  role: { id: 'r1', name: 'Admin' },
};

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderActionsPage(user: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const deleteCalls: string[] = [];

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user } as Response;
      }

      if (init?.method === 'DELETE') {
        deleteCalls.push(url);
        return { ok: true, json: async () => ({}) } as Response;
      }

      return { ok: true, json: async () => workOrder } as Response;
    }
  );

  render(
    createElement(
      MemoryRouter,
      { initialEntries: ['/work-orders/wo1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/work-orders/:id',
            element: createElement(WorkOrderDetailPage),
          }),
          createElement(Route, {
            path: '/work-orders',
            element: createElement(LocationDisplay),
          })
        )
      )
    )
  );

  return deleteCalls;
}

describe('WorkOrderDetailPage actions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('shows Editar and Eliminar actions for Admin and links to the edit route', async () => {
    renderActionsPage(adminUser);

    const editLink = await screen.findByRole('link', { name: 'Editar' });
    expect(editLink).toHaveAttribute('href', '/work-orders/wo1/edit');
    expect(
      screen.getByRole('button', { name: 'Eliminar' })
    ).toBeInTheDocument();
  });

  it('hides Editar and Eliminar for non-privileged roles', async () => {
    renderActionsPage({ ...adminUser, role: { id: 'r2', name: 'Mechanic' } });

    await screen.findByRole('heading', { name: 'Orden OT-0001' });
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Editar' })
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('button', { name: 'Eliminar' })
    ).not.toBeInTheDocument();
  });

  it('S7: deletes the order after confirm and navigates to the list', async () => {
    const deleteCalls = renderActionsPage(adminUser);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de que querés eliminar esta orden de trabajo?'
    );
    await waitFor(() => expect(deleteCalls).toHaveLength(1));
    expect(deleteCalls[0]).toBe('http://localhost:3000/api/work-orders/wo1');
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/work-orders')
    );
  });

  it('S7: does not send the request when the confirm is cancelled', async () => {
    const deleteCalls = renderActionsPage(adminUser);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteCalls).toHaveLength(0);
    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
  });
});

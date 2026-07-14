import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientDetailPage } from './ClientDetailPage';

const client = {
  id: 'c1',
  name: 'Juan Pérez',
  identification: '12345678',
  identificationType: 'DNI',
  phone: '999888777',
  email: 'juan@example.com',
  address: 'Av. Principal 123',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const activeVehicle = {
  id: 'v1',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
  isActive: true,
};

const inactiveVehicle = {
  ...activeVehicle,
  id: 'v2',
  plate: 'XYZ-789',
  isActive: false,
};

const paginatedVehicles = {
  data: [activeVehicle, inactiveVehicle],
  meta: { page: 1, total: 2, totalPages: 1 },
};

const multiPageVehicles = {
  data: [activeVehicle],
  meta: { page: 1, total: 2, totalPages: 2 },
};

const secondPageVehicles = {
  data: [inactiveVehicle],
  meta: { page: 2, total: 2, totalPages: 2 },
};

function createWrapper(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
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
          createElement(Route, { path: '/clients/:id', element: children })
        )
      )
    );
  };
}

function createFetchMock(responses: {
  client?: { ok: boolean; status?: number; json?: () => Promise<unknown> };
  vehicles?: { ok: boolean; status?: number; json?: () => Promise<unknown> };
  secondPageVehicles?: {
    ok: boolean;
    status?: number;
    json?: () => Promise<unknown>;
  };
}) {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes('/clients/')) {
      return Promise.resolve(responses.client);
    }
    if (url.includes('page=2') && responses.secondPageVehicles) {
      return Promise.resolve(responses.secondPageVehicles);
    }
    return Promise.resolve(responses.vehicles);
  });
}

function renderPage(path: string, fetchMock: typeof globalThis.fetch) {
  globalThis.fetch = fetchMock;
  return render(<ClientDetailPage />, { wrapper: createWrapper(path) });
}

describe('ClientDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders client details and active vehicles', async () => {
    const fetchMock = createFetchMock({
      client: { ok: true, json: async () => client },
      vehicles: { ok: true, json: async () => paginatedVehicles },
    });

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    expect(screen.getByText('DNI 12345678')).toBeInTheDocument();
    expect(screen.getByText('999888777')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Av. Principal 123')).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'ABC-123' })).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'XYZ-789' })
    ).not.toBeInTheDocument();
  });

  it('shows a not-found message when the client does not exist', async () => {
    const fetchMock = createFetchMock({
      client: { ok: false, status: 404 },
      vehicles: { ok: true, json: async () => paginatedVehicles },
    });

    renderPage('/clients/missing', fetchMock);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });

  it('paginates the vehicle list', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock({
      client: { ok: true, json: async () => client },
      vehicles: { ok: true, json: async () => multiPageVehicles },
      secondPageVehicles: {
        ok: true,
        json: async () => secondPageVehicles,
      },
    });

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/vehicles?clientId=c1&page=2&limit=10',
        { credentials: 'include' }
      )
    );
  });
});

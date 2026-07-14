import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientDetailPage } from './ClientDetailPage';

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

const mechanicUser = {
  id: 'u2',
  name: 'Pedro',
  email: 'pedro@example.com',
  role: { id: 'r2', name: 'Mechanic' },
};

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

const createdVehicle = {
  id: 'v3',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
  isActive: true,
};

const updatedVehicle = {
  ...activeVehicle,
  brand: 'Honda',
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

function createFetchMock() {
  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/users/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => useUserMock(),
      });
    }
    if (url.includes('/clients/')) {
      return Promise.resolve({ ok: true, json: async () => client });
    }
    if (init?.method === 'POST' && url.includes('/vehicles')) {
      return Promise.resolve({ ok: true, json: async () => createdVehicle });
    }
    if (init?.method === 'PATCH' && url.includes('/vehicles/')) {
      return Promise.resolve({ ok: true, json: async () => updatedVehicle });
    }
    if (init?.method === 'DELETE' && url.includes('/vehicles/')) {
      return Promise.resolve({ ok: true });
    }
    return Promise.resolve({ ok: true, json: async () => paginatedVehicles });
  });
}

function renderPage(path: string, fetchMock: typeof globalThis.fetch) {
  globalThis.fetch = fetchMock;
  return render(<ClientDetailPage />, { wrapper: createWrapper(path) });
}

describe('ClientDetailPage', () => {
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

  it('renders client details and active vehicles', async () => {
    const fetchMock = createFetchMock();

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
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/users/me')) {
        return Promise.resolve({ ok: true, json: async () => adminUser });
      }
      if (url.includes('/clients/')) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      return Promise.resolve({ ok: true, json: async () => paginatedVehicles });
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
    const fetchMock = createFetchMock().mockImplementation((url: string) => {
      if (url.includes('page=2')) {
        return Promise.resolve({
          ok: true,
          json: async () => secondPageVehicles,
        });
      }
      if (url.includes('/users/me')) {
        return Promise.resolve({ ok: true, json: async () => adminUser });
      }
      if (url.includes('/clients/')) {
        return Promise.resolve({ ok: true, json: async () => client });
      }
      return Promise.resolve({ ok: true, json: async () => multiPageVehicles });
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

  it('shows the new vehicle button for Admin users', async () => {
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    expect(
      screen.getByRole('button', { name: 'Nuevo vehículo' })
    ).toBeInTheDocument();
  });

  it('hides the new vehicle button for non-Admin/Reception users', async () => {
    useUserMock.mockReturnValue({
      user: mechanicUser,
      isLoading: false,
      error: null,
    });
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    expect(
      screen.queryByRole('button', { name: 'Nuevo vehículo' })
    ).not.toBeInTheDocument();
  });

  it('opens the vehicle form when clicking new vehicle', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Nuevo vehículo' }));

    expect(screen.getByLabelText('Placa')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear vehículo' })
    ).toBeInTheDocument();
  });

  it('creates a vehicle when the form is submitted', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Nuevo vehículo' }));

    await user.type(screen.getByLabelText('Placa'), 'ABC123');
    await user.type(screen.getByLabelText('Marca'), 'Toyota');
    await user.type(screen.getByLabelText('Modelo'), 'Corolla');
    await user.type(screen.getByLabelText('Año'), '2020');

    await user.click(screen.getByRole('button', { name: 'Crear vehículo' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/vehicles',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('ABC123'),
        })
      )
    );
  });

  it('opens the edit form with vehicle values', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Editar ABC-123' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Editar ABC-123' }));

    expect(screen.getByDisplayValue('ABC-123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('updates a vehicle when the edit form is submitted', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Editar ABC-123' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Editar ABC-123' }));

    await user.clear(screen.getByLabelText('Marca'));
    await user.type(screen.getByLabelText('Marca'), 'Honda');

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/vehicles/v1',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('Honda'),
        })
      )
    );
  });

  it('deletes a vehicle after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Eliminar ABC-123' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar ABC-123' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/vehicles/v1',
        expect.objectContaining({ method: 'DELETE' })
      )
    );
  });

  it('does not delete a vehicle when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchMock = createFetchMock();

    renderPage('/clients/c1', fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Eliminar ABC-123' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar ABC-123' }));

    expect(fetchMock).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/vehicles/v1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

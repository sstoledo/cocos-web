import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientListPage } from './ClientListPage';

const user = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const client = {
  id: 'c1',
  name: 'Juan Pérez',
  identification: '12345678',
  identificationType: 'DNI',
  phone: '999888777',
  email: 'juan@example.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const paginatedResponse = {
  data: [client],
  meta: { page: 1, total: 1, totalPages: 1 },
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

describe('ClientListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header and filters', async () => {
    mockFetch(paginatedResponse);

    render(<ClientListPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { name: 'Clientes' })
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );

    expect(
      screen.getByRole('searchbox', { name: 'Buscar clientes' })
    ).toBeInTheDocument();
  });

  it('shows a loading state and then the table', async () => {
    mockFetch(paginatedResponse);

    render(<ClientListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando clientes…')).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );
  });

  it('shows an error message when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user };
      }
      return { ok: false, status: 500 };
    });

    render(<ClientListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los clientes'
      )
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

    render(<ClientListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando clientes…')).not.toBeInTheDocument()
    );

    await testUser.type(screen.getByRole('searchbox'), 'juan');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/clients?query=juan&page=1&limit=10',
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

    render(<ClientListPage />, {
      wrapper: createWrapper(['/clients?query=juan&page=2']),
    });

    expect(screen.getByRole('searchbox')).toHaveValue('juan');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/clients?query=juan&page=2&limit=10',
        { credentials: 'include' }
      )
    );
  });
});

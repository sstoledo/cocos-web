import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientFormPage } from './ClientFormPage';

const createdClient = {
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

const existingClient = {
  ...createdClient,
  id: 'c2',
  name: 'María López',
  identification: '87654321',
  phone: '111222333',
  email: 'maria@example.com',
  address: 'Av. Secundaria 456',
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
          createElement(Route, { path: '/clients/new', element: children }),
          createElement(Route, {
            path: '/clients/:id/edit',
            element: children,
          }),
          createElement(Route, {
            path: '/clients',
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

function renderPage(
  path: string,
  response: { ok: boolean; status?: number; json?: () => Promise<unknown> }
) {
  globalThis.fetch = vi.fn().mockResolvedValue(response);

  const user = userEvent.setup();
  render(<ClientFormPage />, { wrapper: createWrapper(path) });

  return { user };
}

describe('ClientFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the create page title', () => {
    renderPage('/clients/new', { ok: true, json: async () => ({}) });

    expect(
      screen.getByRole('heading', { name: 'Nuevo cliente' })
    ).toBeInTheDocument();
  });

  it('submits the form and redirects to the client list', async () => {
    const { user } = renderPage('/clients/new', {
      ok: true,
      json: async () => createdClient,
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Nombre'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Identificación'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/clients',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
    );

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/clients')
    );
  });

  it('prefills the form in edit mode and submits a PATCH', async () => {
    const { user } = renderPage('/clients/c2/edit', {
      ok: true,
      json: async () => existingClient,
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Nombre')).toHaveValue('María López')
    );

    expect(
      screen.getByRole('heading', { name: 'Editar cliente' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'María López Actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/clients/c2',
        expect.objectContaining({
          method: 'PATCH',
          credentials: 'include',
        })
      )
    );

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/clients')
    );
  });

  it('shows a not-found message when the client does not exist', async () => {
    renderPage('/clients/missing/edit', { ok: false, status: 404 });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });
});

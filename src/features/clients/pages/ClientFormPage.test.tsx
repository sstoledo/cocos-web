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
      { initialEntries: ['/clients/new'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/clients/new', element: children }),
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

describe('ClientFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the create page title', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<ClientFormPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { name: 'Nuevo cliente' })
    ).toBeInTheDocument();
  });

  it('submits the form and redirects to the client list', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => createdClient,
    });

    render(<ClientFormPage />, { wrapper: createWrapper() });

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
});

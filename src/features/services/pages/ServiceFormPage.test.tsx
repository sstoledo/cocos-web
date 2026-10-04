import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceFormPage } from './ServiceFormPage';

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
      { initialEntries: ['/services/new'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/services/new',
            element: children,
          }),
          createElement(Route, {
            path: '/services',
            element: createElement(LocationDisplay),
          })
        )
      )
    );
  };
}

function createEditWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/services/srv-1/edit'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/services/:id/edit',
            element: children,
          }),
          createElement(Route, {
            path: '/services',
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

const service = {
  id: 'srv-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: '150.00',
  estimatedDuration: 30,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const createdService = {
  id: 'srv-1',
  code: 'SRV-002',
  name: 'Nuevo servicio',
  price: '100.00',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const updatedService = {
  ...service,
  name: 'Servicio actualizado',
};

describe('ServiceFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('create mode', () => {
    it('renders the page title and form immediately (no references to load)', () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(<ServiceFormPage />, {
        wrapper: createWrapper(),
      });

      expect(
        screen.getByRole('heading', { name: 'Nuevo servicio' })
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Código')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /crear servicio/i })
      ).toBeInTheDocument();
    });

    it('submits the form and navigates to the service list', async () => {
      const user = userEvent.setup();
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createdService,
        });

      render(<ServiceFormPage />, {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(screen.getByLabelText('Código')).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText('Código'), 'SRV-002');
      await user.type(screen.getByLabelText('Nombre'), 'Nuevo servicio');
      await user.type(screen.getByLabelText('Precio'), '100');
      await user.type(
        screen.getByLabelText('Duración estimada (minutos)'),
        '45'
      );

      await user.click(screen.getByRole('button', { name: /crear servicio/i }));

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/services',
          expect.objectContaining({
            method: 'POST',
            credentials: 'include',
          })
        )
      );

      const createCall = (
        globalThis.fetch as ReturnType<typeof vi.fn>
      ).mock.calls.find(
        (call) =>
          call[0] === 'http://localhost:3000/api/services' &&
          (call[1] as RequestInit).method === 'POST'
      );
      const requestInit = createCall?.[1] as RequestInit;
      const body = JSON.parse(requestInit.body as string);
      expect(body.code).toBe('SRV-002');
      expect(body.name).toBe('Nuevo servicio');
      expect(body.price).toBe(100);
      expect(body.estimatedDuration).toBe(45);

      await waitFor(() =>
        expect(screen.getByTestId('location')).toHaveTextContent('/services')
      );
    });
  });

  describe('edit mode', () => {
    it('renders the edit page title and prefills the form', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => service,
      });

      render(<ServiceFormPage />, {
        wrapper: createEditWrapper(),
      });

      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: 'Editar servicio' })
        ).toBeInTheDocument()
      );

      await waitFor(() =>
        expect(screen.getByLabelText('Código')).toHaveValue('SRV-001')
      );

      expect(screen.getByLabelText('Nombre')).toHaveValue('Cambio de aceite');
      expect(screen.getByLabelText('Descripción')).toHaveValue(
        'Cambio de aceite y filtro'
      );
      expect(screen.getByLabelText('Precio')).toHaveValue(150);
      expect(screen.getByLabelText('Duración estimada (minutos)')).toHaveValue(
        30
      );
      expect(screen.getByRole('switch', { name: 'Activo' })).toBeChecked();
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' })
      ).toBeInTheDocument();
    });

    it('updates the service and navigates to the service list', async () => {
      const user = userEvent.setup();
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => service,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedService,
        });

      render(<ServiceFormPage />, {
        wrapper: createEditWrapper(),
      });

      await waitFor(() =>
        expect(screen.getByLabelText('Código')).toBeInTheDocument()
      );

      await user.clear(screen.getByLabelText('Nombre'));
      await user.type(screen.getByLabelText('Nombre'), 'Servicio actualizado');
      await user.clear(screen.getByLabelText('Precio'));
      await user.type(screen.getByLabelText('Precio'), '200');

      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/services/srv-1',
          expect.objectContaining({
            method: 'PATCH',
            credentials: 'include',
          })
        )
      );

      const patchCall = (
        globalThis.fetch as ReturnType<typeof vi.fn>
      ).mock.calls.find(
        (call) =>
          call[0] === 'http://localhost:3000/api/services/srv-1' &&
          (call[1] as RequestInit).method === 'PATCH'
      );
      const requestInit = patchCall?.[1] as RequestInit;
      const body = JSON.parse(requestInit.body as string);
      expect(body.name).toBe('Servicio actualizado');
      expect(body.price).toBe(200);

      await waitFor(() =>
        expect(screen.getByTestId('location')).toHaveTextContent('/services')
      );
    });

    it('shows error when service fails to load', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<ServiceFormPage />, {
        wrapper: createEditWrapper(),
      });

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudieron cargar los datos'
        )
      );
    });
  });
});

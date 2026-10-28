import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { ServiceTable } from './ServiceTable';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

type ReactNode = React.ReactNode;

const services: Service[] = [
  {
    id: 'srv-1',
    code: 'SRV-001',
    name: 'Cambio de aceite',
    price: '150.00',
    estimatedDuration: 30,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'srv-2',
    code: 'SRV-002',
    name: 'Lavado',
    price: '50.00',
    estimatedDuration: null,
    isActive: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('ServiceTable', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  function renderTable(servicesToRender: Service[] = services) {
    return render(
      <MemoryRouter>
        <ServiceTable services={servicesToRender} />
      </MemoryRouter>,
      { wrapper: createWrapper() }
    );
  }

  it('renders the approved mobile service card', () => {
    renderTable([services[0]]);

    const card = screen.getByTestId('service-mobile-card');
    expect(card).toHaveTextContent('SRV-001');
    expect(card).toHaveTextContent('Cambio de aceite');
    expect(card).toHaveTextContent('Activo');
    expect(card).toHaveTextContent('30 min');
  });

  it('renders table with services', () => {
    renderTable();

    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('Duración estimada')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    expect(screen.getAllByText('SRV-001')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cambio de aceite')[0]).toBeInTheDocument();
    expect(screen.getAllByText('SRV-002')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Lavado')[0]).toBeInTheDocument();
  });

  it('formats price as currency', () => {
    renderTable();

    expect(screen.getAllByText(/\$[\s\u00A0]150,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/\$[\s\u00A0]50,00/)[0]).toBeInTheDocument();
  });

  it('shows N/A for null estimatedDuration', () => {
    renderTable();

    expect(screen.getAllByText('30 min')[0]).toBeInTheDocument();
    expect(screen.getAllByText('N/A')[0]).toBeInTheDocument();
  });

  it('shows active badge for active service', () => {
    renderTable();

    const activeBadge = screen.getAllByText('Activo')[0];
    expect(activeBadge).toBeInTheDocument();
    expect(activeBadge.closest('span')).toHaveClass('bg-success');
  });

  it('shows inactive badge for inactive service', () => {
    renderTable();

    const inactiveBadge = screen.getAllByText('Inactivo')[0];
    expect(inactiveBadge).toBeInTheDocument();
    expect(inactiveBadge.closest('span')).toHaveClass('bg-destructive');
  });

  it('renders edit link', () => {
    renderTable();

    const editLink = screen.getAllByLabelText('Editar Cambio de aceite')[0];
    expect(editLink).toHaveAttribute('href', '/services/srv-1/edit');
  });

  it('calls delete mutation after confirming in the dialog', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });
    renderTable();

    fireEvent.click(screen.getAllByLabelText('Eliminar Cambio de aceite')[0]);

    expect(screen.getByText('Eliminar servicio')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/services/srv-1',
        { method: 'DELETE', credentials: 'include' }
      );
    });
  });

  it('does not call delete mutation when the dialog is cancelled', async () => {
    globalThis.fetch = vi.fn();
    renderTable();

    fireEvent.click(screen.getAllByLabelText('Eliminar Cambio de aceite')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByText('Eliminar servicio')).not.toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('shows empty state when no services', () => {
    renderTable([]);

    expect(
      screen.getByText('No se encontraron servicios.')
    ).toBeInTheDocument();
  });
});

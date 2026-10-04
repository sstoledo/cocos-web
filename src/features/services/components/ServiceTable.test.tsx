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
  });

  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  function renderTable(servicesToRender: Service[] = services) {
    return render(
      <MemoryRouter>
        <ServiceTable services={servicesToRender} />
      </MemoryRouter>,
      { wrapper: createWrapper() }
    );
  }

  it('renders table with services', () => {
    renderTable();

    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('Duración estimada')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    expect(screen.getByText('SRV-001')).toBeInTheDocument();
    expect(screen.getByText('Cambio de aceite')).toBeInTheDocument();
    expect(screen.getByText('SRV-002')).toBeInTheDocument();
    expect(screen.getByText('Lavado')).toBeInTheDocument();
  });

  it('formats price as currency', () => {
    renderTable();

    expect(screen.getByText(/\$[\s\u00A0]150,00/)).toBeInTheDocument();
    expect(screen.getByText(/\$[\s\u00A0]50,00/)).toBeInTheDocument();
  });

  it('shows N/A for null estimatedDuration', () => {
    renderTable();

    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('shows active badge for active service', () => {
    renderTable();

    const activeBadge = screen.getByText('Activo');
    expect(activeBadge).toBeInTheDocument();
    expect(activeBadge.closest('span')).toHaveClass('bg-green-100');
  });

  it('shows inactive badge for inactive service', () => {
    renderTable();

    const inactiveBadge = screen.getByText('Inactivo');
    expect(inactiveBadge).toBeInTheDocument();
    expect(inactiveBadge.closest('span')).toHaveClass('bg-red-100');
  });

  it('renders edit link', () => {
    renderTable();

    const editLink = screen.getByLabelText('Editar Cambio de aceite');
    expect(editLink).toHaveAttribute('href', '/services/srv-1/edit');
  });

  it('calls delete mutation on delete button click', async () => {
    renderTable();

    fireEvent.click(screen.getByLabelText('Eliminar Cambio de aceite'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que querés eliminar este servicio?'
      );
    });
  });

  it('shows empty state when no services', () => {
    renderTable([]);

    expect(
      screen.getByText('No se encontraron servicios.')
    ).toBeInTheDocument();
  });
});

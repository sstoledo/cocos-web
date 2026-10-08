import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaginationMeta, Vehicle } from '../types';
import { VehicleTable } from './VehicleTable';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const vehicles: Vehicle[] = [
  {
    id: 'veh-1',
    plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanco',
    clientId: 'client-1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const meta: PaginationMeta = { page: 1, totalPages: 1, total: 1 };

describe('VehicleTable', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function renderTable() {
    return render(
      <MemoryRouter>
        <VehicleTable vehicles={vehicles} meta={meta} onPageChange={vi.fn()} />
      </MemoryRouter>,
      { wrapper: createWrapper() }
    );
  }

  it('renders vehicle rows', () => {
    renderTable();

    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Corolla')).toBeInTheDocument();
  });

  it('calls delete mutation after confirming in the dialog', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });
    renderTable();

    fireEvent.click(screen.getByLabelText('Eliminar ABC123'));

    expect(screen.getByText('Eliminar vehículo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/vehicles/veh-1',
        { method: 'DELETE', credentials: 'include' }
      );
    });
  });

  it('does not call delete mutation when the dialog is cancelled', async () => {
    globalThis.fetch = vi.fn();
    renderTable();

    fireEvent.click(screen.getByLabelText('Eliminar ABC123'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByText('Eliminar vehículo')).not.toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

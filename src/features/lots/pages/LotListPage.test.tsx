import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LotListPage } from './LotListPage';

function createWrapper(initialEntries?: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries },
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  };
}

const lot = {
  id: 'lot-1',
  lotNumber: 'L-2026-001',
  supplier: { id: 's1', name: 'Proveedor A' },
  receivedAt: '2026-07-13T12:00:00.000Z',
  notes: 'Notas de recepción',
  items: [
    {
      id: 'i1',
      product: { id: 'p1', name: 'Aceite 5W30' },
      quantity: 24,
      remainingQuantity: 24,
      costPrice: '12.50',
      expirationDate: '2027-01-01T00:00:00.000Z',
    },
    {
      id: 'i2',
      product: { id: 'p2', name: 'Filtro de aceite' },
      quantity: 10,
      remainingQuantity: 10,
      costPrice: '8.00',
      expirationDate: '2027-02-01T00:00:00.000Z',
    },
  ],
};

describe('LotListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header, new lot link, and filters', () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<LotListPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { name: 'Lotes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nuevo lote' })).toHaveAttribute(
      'href',
      '/lots/new'
    );
    expect(
      screen.getByRole('searchbox', { name: 'Buscar lotes' })
    ).toBeInTheDocument();
  });

  it('shows a loading state and then the table with lots', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [lot],
    });

    render(<LotListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando lotes…')).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'L-2026-001' })
      ).toBeInTheDocument()
    );

    expect(
      screen.getByRole('cell', { name: 'Proveedor A' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '13/7/2026' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: '2 productos' })
    ).toBeInTheDocument();
    expect(screen.getByText('En stock')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<LotListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los lotes'
      )
    );
  });

  it('syncs the search input to the URL', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<LotListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando lotes…')).not.toBeInTheDocument()
    );

    await user.type(screen.getByRole('searchbox'), 'L-2026');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/lots?q=L-2026',
        { credentials: 'include' }
      )
    );
  });

  it('reads the initial filter from the URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<LotListPage />, {
      wrapper: createWrapper(['/lots?q=L-2026']),
    });

    expect(screen.getByRole('searchbox')).toHaveValue('L-2026');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/lots?q=L-2026',
        { credentials: 'include' }
      )
    );
  });
});

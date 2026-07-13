import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductListPage } from './ProductListPage';

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

const product = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'brand1', name: 'Castrol' },
  category: { id: 'cat1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header, new product link, and filters', () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProductListPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { name: 'Productos' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Nuevo producto' })
    ).toHaveAttribute('href', '/products/new');
    expect(
      screen.getByRole('searchbox', { name: 'Buscar productos' })
    ).toBeInTheDocument();
  });

  it('shows a loading state and then the table with products', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [product],
    });

    render(<ProductListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando productos…')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('cell', { name: 'COD-001' })).toBeInTheDocument()
    );

    expect(
      screen.getByRole('cell', { name: 'Aceite 20W50' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Castrol' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Lubricantes' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Litro' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '25.00' })).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ProductListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los productos'
      )
    );
  });

  it('syncs search input and status filter to the URL', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ProductListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando productos…')).not.toBeInTheDocument()
    );

    await user.type(screen.getByRole('searchbox'), 'aceite');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por estado' }),
      'true'
    );

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/products?q=aceite&isActive=true',
        { credentials: 'include' }
      )
    );
  });

  it('reads initial filters from the URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProductListPage />, {
      wrapper: createWrapper(['/products?q=aceite&isActive=false']),
    });

    expect(screen.getByRole('searchbox')).toHaveValue('aceite');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?q=aceite&isActive=false',
        { credentials: 'include' }
      )
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductListItem, ProductListResponse } from '../types';
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

function userWithRole(role: string) {
  return {
    id: 'u1',
    name: 'Ana',
    email: 'ana@example.com',
    role: { id: 'r1', name: role },
  };
}

const references = {
  presentations: [{ id: 'pres1', name: 'Litro' }],
  brands: [{ id: 'brand1', name: 'Castrol' }],
  categories: [{ id: 'cat1', name: 'Lubricantes' }],
};

function mockFetch(response: object, role = 'Admin') {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => userWithRole(role) };
    }
    if (url.includes('/presentations')) {
      return { ok: true, json: async () => references.presentations };
    }
    if (url.includes('/brands')) {
      return { ok: true, json: async () => references.brands };
    }
    if (url.includes('/categories')) {
      return { ok: true, json: async () => references.categories };
    }
    return { ok: true, json: async () => response };
  });
}

const product: ProductListItem = {
  id: 'p1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  stock: 7,
  imageUrl: null,
  isActive: true,
  presentation: { id: 'pres1', name: 'Litro' },
  brand: { id: 'brand1', name: 'Castrol' },
  category: { id: 'cat1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockResponse: ProductListResponse = {
  data: [product],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the header, new product link, and filters', async () => {
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

    render(<ProductListPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { name: 'Productos' })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Nuevo producto' })
      ).toHaveAttribute('href', '/products/new')
    );
    expect(
      screen.getByRole('searchbox', { name: 'Buscar productos' })
    ).toBeInTheDocument();
  });

  it.each(['Admin', 'Warehouse'])(
    'shows the new product link and edit action for %s',
    async (role) => {
      mockFetch(mockResponse, role);

      render(<ProductListPage />, { wrapper: createWrapper() });

      await waitFor(() =>
        expect(
          screen.getByRole('link', { name: 'Nuevo producto' })
        ).toBeInTheDocument()
      );
      expect(screen.getByRole('cell', { name: 'COD-001' })).toBeInTheDocument();
      expect(
        screen.getAllByRole('link', { name: 'Editar' })[0]
      ).toHaveAttribute('href', '/products/p1/edit');
    }
  );

  it.each(['Reception', 'Mechanic'])(
    'hides the new product link and edit action for %s',
    async (role) => {
      mockFetch(mockResponse, role);

      render(<ProductListPage />, { wrapper: createWrapper() });

      await waitFor(() =>
        expect(
          screen.getByRole('cell', { name: 'COD-001' })
        ).toBeInTheDocument()
      );
      await waitFor(() =>
        expect(
          screen.queryByRole('link', { name: 'Nuevo producto' })
        ).not.toBeInTheDocument()
      );
      expect(
        screen.queryByRole('link', { name: 'Editar' })
      ).not.toBeInTheDocument();
    }
  );

  it('shows a loading state and then the table with products', async () => {
    mockFetch(mockResponse);

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
    expect(screen.getByRole('cell', { name: '7' })).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
  });

  it('shows an error message when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/products')) {
        return { ok: false, status: 500 };
      }
      return { ok: true, json: async () => [] };
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
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

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
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?q=aceite&isActive=true&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('syncs brand, category and presentation filters to the request', async () => {
    const user = userEvent.setup();
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

    render(<ProductListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Filtrar por marca' })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText('Cargando productos…')).not.toBeInTheDocument()
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por marca' }),
      'brand1'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por categoría' }),
      'cat1'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por presentación' }),
      'pres1'
    );

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?brandId=brand1&categoryId=cat1&presentationId=pres1&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('sends no isActive param when the status filter is Todos', async () => {
    const user = userEvent.setup();
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

    render(<ProductListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('Cargando productos…')).not.toBeInTheDocument()
    );

    const statusSelect = screen.getByRole('combobox', {
      name: 'Filtrar por estado',
    });
    await user.selectOptions(statusSelect, 'true');
    await user.selectOptions(statusSelect, '');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('reads initial filters from the URL', async () => {
    mockFetch({ data: [], meta: { page: 1, limit: 10, total: 0 } });

    render(<ProductListPage />, {
      wrapper: createWrapper([
        '/products?q=aceite&isActive=false&brandId=brand1',
      ]),
    });

    expect(screen.getByRole('searchbox')).toHaveValue('aceite');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products?q=aceite&isActive=false&brandId=brand1&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('renders pagination when there is more than one page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [product],
        meta: { page: 2, limit: 10, total: 100 },
      }),
    });

    render(<ProductListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Página 2 de 10')).toBeInTheDocument()
    );
  });
});

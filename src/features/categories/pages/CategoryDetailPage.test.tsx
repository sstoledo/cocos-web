import type { CategoryListResponse } from '@/features/categories/types';
import type { ProductListResponse } from '@/features/products/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category } from '../types';
import { CategoryDetailPage } from './CategoryDetailPage';

const category: Category = {
  id: 'cat-1',
  name: 'Filtros',
  parentId: null,
  parent: null,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

const childCategory: Category = {
  id: 'cat-2',
  name: 'Filtros de aceite',
  parentId: 'cat-1',
  parent: {
    id: 'cat-1',
    name: 'Filtros',
    parentId: null,
    parent: null,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  createdAt: '2024-02-01T10:00:00.000Z',
  updatedAt: '2024-02-01T10:00:00.000Z',
};

const categoriesResponse: CategoryListResponse = {
  data: [childCategory],
  meta: { page: 1, limit: 10, total: 1 },
};

const productsResponse: ProductListResponse = {
  data: [
    {
      id: 'p1',
      code: 'PROD-001',
      name: 'Filtro de aceite sintético',
      price: '18000.00',
      isActive: true,
      presentation: { id: 'pr1', name: 'Unidad' },
      brand: { id: 'br-1', name: 'Bosch' },
      category: { id: 'cat-2', name: 'Filtros de aceite', parent: null },
      createdAt: '2024-03-01T10:00:00.000Z',
      updatedAt: '2024-03-01T10:00:00.000Z',
    },
    {
      id: 'p2',
      code: 'PROD-002',
      name: 'Bujía NGK',
      price: '8000.00',
      isActive: true,
      presentation: { id: 'pr2', name: 'Caja x4' },
      brand: { id: 'br-2', name: 'NGK' },
      category: { id: 'cat-3', name: 'Encendido', parent: null },
      createdAt: '2024-03-02T10:00:00.000Z',
      updatedAt: '2024-03-02T10:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 10, total: 2 },
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
      { initialEntries: ['/categories/cat-1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/categories/:id', element: children })
        )
      )
    );
  };
}

function createMockFetch() {
  return vi.fn((url: string) => {
    if (url.includes('/categories/cat-1')) {
      return Promise.resolve({ ok: true, json: async () => category });
    }
    if (url.includes('/products')) {
      return Promise.resolve({
        ok: true,
        json: async () => productsResponse,
      });
    }
    if (url.includes('/categories')) {
      return Promise.resolve({
        ok: true,
        json: async () => categoriesResponse,
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  }) as unknown as typeof fetch;
}

describe('CategoryDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderPage(fetchMock: typeof globalThis.fetch) {
    globalThis.fetch = fetchMock;
    return render(<CategoryDetailPage />, { wrapper: createWrapper() });
  }

  it('shows loading state initially', () => {
    renderPage(vi.fn().mockImplementation(() => new Promise(() => {})));

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows category info when loaded', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Filtros' })
      ).toBeInTheDocument()
    );
  });

  it('shows subcategories and their products', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByText('Subcategorías (1)')).toBeInTheDocument()
    );

    expect(screen.getByText('Filtros de aceite')).toBeInTheDocument();
    expect(screen.getByText('Productos (1)')).toBeInTheDocument();
    expect(screen.getByText('Filtro de aceite sintético')).toBeInTheDocument();
    expect(screen.queryByText('Bujía NGK')).not.toBeInTheDocument();
    expect(screen.getByText(/\$[\s\u00A0]?18\.000,00/)).toBeInTheDocument();
  });

  it('shows error state when request fails', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/categories/cat-1')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => productsResponse,
        });
      }
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => categoriesResponse,
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }) as unknown as typeof fetch;

    renderPage(fetchMock);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
      )
    );
  });
});

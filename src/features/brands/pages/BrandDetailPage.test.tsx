import type { ProductListResponse } from '@/features/products/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Brand } from '../types';
import { BrandDetailPage } from './BrandDetailPage';

const brand: Brand = {
  id: 'br-1',
  name: 'Bosch',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

const brandProducts: ProductListResponse = {
  data: [
    {
      id: 'p1',
      code: 'PROD-001',
      name: 'Filtro de aceite',
      price: '15000.00',
      isActive: true,
      presentation: { id: 'pr1', name: 'Unidad' },
      brand: { id: 'br-1', name: 'Bosch' },
      category: { id: 'c1', name: 'Filtros', parent: null },
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
      category: { id: 'c2', name: 'Encendido', parent: null },
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
      { initialEntries: ['/brands/br-1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/brands/:id', element: children })
        )
      )
    );
  };
}

function createMockFetch() {
  return vi.fn((url: string) => {
    if (url.includes('/brands/br-1')) {
      return Promise.resolve({ ok: true, json: async () => brand });
    }
    if (url.includes('/products')) {
      return Promise.resolve({
        ok: true,
        json: async () => brandProducts,
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  }) as unknown as typeof fetch;
}

describe('BrandDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderPage(fetchMock: typeof globalThis.fetch) {
    globalThis.fetch = fetchMock;
    return render(<BrandDetailPage />, { wrapper: createWrapper() });
  }

  it('shows loading state initially', () => {
    renderPage(vi.fn().mockImplementation(() => new Promise(() => {})));

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows brand info when loaded', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bosch' })).toBeInTheDocument()
    );
  });

  it('shows only products of this brand', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByText('Productos (1)')).toBeInTheDocument()
    );

    expect(screen.getByText('Filtro de aceite')).toBeInTheDocument();
    expect(screen.queryByText('Bujía NGK')).not.toBeInTheDocument();
    expect(screen.getByText('Unidad')).toBeInTheDocument();
    expect(screen.getByText(/\$[\s\u00A0]?15\.000,00/)).toBeInTheDocument();
  });

  it('shows error state when request fails', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/brands/br-1')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => brandProducts,
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

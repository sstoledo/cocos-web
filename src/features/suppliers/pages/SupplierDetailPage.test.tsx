import type { LotListResponse } from '@/features/lots/types';
import type { PurchaseOrderListResponse } from '@/features/purchase-orders/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../types';
import { SupplierDetailPage } from './SupplierDetailPage';

const supplier: Supplier = {
  id: 'sup-1',
  name: 'Proveedor Test',
  phone: '1199998888',
  email: 'test@proveedor.com',
  address: 'Calle 123',
  isActive: true,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

const mockPOResponse: PurchaseOrderListResponse = {
  data: [
    {
      id: 'po-1',
      purchaseOrderNumber: 'COM-2024-000001',
      supplierId: 'sup-1',
      status: 'received',
      estimatedTotal: '50000.00',
      supplier: { id: 'sup-1', name: 'Proveedor Test' },
      lines: [],
      createdAt: '2024-02-01T10:00:00.000Z',
      updatedAt: '2024-02-01T10:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 10, total: 1 },
};

const mockLotsResponse: LotListResponse = {
  data: [
    {
      id: 'lot-1',
      lotNumber: 'L-2024-001',
      supplier: { id: 'sup-1', name: 'Proveedor Test' },
      receivedAt: '2024-02-15T10:00:00.000Z',
      notes: '',
      items: [
        {
          id: 'i1',
          product: { id: 'p1', name: 'Producto A' },
          quantity: 10,
          remainingQuantity: 10,
          costPrice: '100.00',
          expirationDate: '2025-01-01T00:00:00.000Z',
        },
      ],
    },
  ],
  meta: { page: 1, limit: 10, total: 1 },
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
      { initialEntries: ['/suppliers/sup-1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/suppliers/:id', element: children })
        )
      )
    );
  };
}

function createMockFetch() {
  return vi.fn((url: string) => {
    if (url.includes('/suppliers/sup-1')) {
      return Promise.resolve({ ok: true, json: async () => supplier });
    }
    if (url.includes('/purchase-orders')) {
      return Promise.resolve({ ok: true, json: async () => mockPOResponse });
    }
    if (url.includes('/lots')) {
      return Promise.resolve({ ok: true, json: async () => mockLotsResponse });
    }
    return Promise.resolve({ ok: false, status: 404 });
  }) as unknown as typeof fetch;
}

describe('SupplierDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderPage(fetchMock: typeof globalThis.fetch) {
    globalThis.fetch = fetchMock;
    return render(<SupplierDetailPage />, { wrapper: createWrapper() });
  }

  it('shows loading state initially', () => {
    renderPage(vi.fn().mockImplementation(() => new Promise(() => {})));

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows supplier info when loaded', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByText('Proveedor Test')).toBeInTheDocument()
    );

    expect(screen.getByText('1199998888')).toBeInTheDocument();
    expect(screen.getByText('test@proveedor.com')).toBeInTheDocument();
    expect(screen.getByText('Calle 123')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows purchase orders section', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByText('COM-2024-000001')).toBeInTheDocument()
    );

    expect(screen.getByText('Órdenes de compra (1)')).toBeInTheDocument();
    expect(screen.getByText('Recibida')).toBeInTheDocument();
  });

  it('shows lots section', async () => {
    renderPage(createMockFetch());

    await waitFor(() =>
      expect(screen.getByText('L-2024-001')).toBeInTheDocument()
    );

    expect(screen.getByText('Lotes recibidos (1)')).toBeInTheDocument();
    expect(screen.getByText('Producto A × 10')).toBeInTheDocument();
  });

  it('shows error state when request fails', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/suppliers/sup-1')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/purchase-orders')) {
        return Promise.resolve({ ok: true, json: async () => mockPOResponse });
      }
      if (url.includes('/lots')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLotsResponse,
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

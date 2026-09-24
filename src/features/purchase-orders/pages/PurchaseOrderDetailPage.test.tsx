import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder, buildPurchaseOrderLine } from '../test/fixtures';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderDetailPage } from './PurchaseOrderDetailPage';

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

const adminUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const purchaseOrder = buildPurchaseOrder({
  notes: 'Pedido mensual de filtros',
  lines: [
    buildPurchaseOrderLine({
      id: 'line1',
      quantityOrdered: 10,
      quantityReceived: 4,
      estimatedCostPrice: '50.00',
      product: { id: 'p1', code: 'PRD-001', name: 'Filtro de aceite' },
    }),
    buildPurchaseOrderLine({
      id: 'line2',
      productId: 'p2',
      quantityOrdered: 5,
      quantityReceived: 0,
      estimatedCostPrice: '120.75',
      product: { id: 'p2', code: 'PRD-002', name: 'Filtro de aire' },
    }),
  ],
  receipts: [
    {
      lotId: 'lot1',
      lotNumber: 'LOT-2024-0001',
      receivedAt: '2024-02-01T00:00:00.000Z',
      items: [
        {
          productId: 'p1',
          quantity: 4,
          costPrice: '48.50',
          expirationDate: '2025-06-01T00:00:00.000Z',
        },
      ],
    },
  ],
});

function mockFetchWithPurchaseOrder(response: PurchaseOrder) {
  return vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/users/me')) {
      return { ok: true, json: async () => adminUser };
    }
    return { ok: true, json: async () => response };
  });
}

function createWrapper(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries },
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  };
}

function renderDetailPage() {
  return render(
    <Routes>
      <Route
        path="/purchase-orders/:id"
        element={<PurchaseOrderDetailPage />}
      />
    </Routes>,
    { wrapper: createWrapper(['/purchase-orders/po1']) }
  );
}

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    useUserMock.mockReturnValue({
      user: adminUser,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    useUserMock.mockReset();
  });

  it('renders the header with the number, badge and supplier section', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(purchaseOrder);

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Orden COM-2024-000001' })
      ).toBeInTheDocument()
    );
    expect(screen.getByText('Borrador')).toBeInTheDocument();
    expect(screen.getByText('Repuestos SA')).toBeInTheDocument();
    expect(screen.getByText('Pedido mensual de filtros')).toBeInTheDocument();
  });

  it('renders lines with ordered/received quantities and verbatim money', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(purchaseOrder);

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Filtro de aceite' })
      ).toBeInTheDocument()
    );

    for (const column of [
      'Producto',
      'Cantidad pedida',
      'Cantidad recibida',
      'Costo estimado',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: column })
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole('cell', { name: 'Filtro de aire' })
    ).toBeInTheDocument();
    // Decimal money strings render verbatim — no recomputation.
    expect(screen.getByRole('cell', { name: '50.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '120.75' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '4' })).toBeInTheDocument();
    expect(screen.getByText('Total estimado: 500.00')).toBeInTheDocument();
  });

  it('renders receipt history with lot numbers as text and actual costs', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(purchaseOrder);

    renderDetailPage();

    await waitFor(() =>
      expect(screen.getByText(/LOT-2024-0001/)).toBeInTheDocument()
    );

    // No lot detail page exists — the lot number is plain text, not a link.
    expect(
      screen.queryByRole('link', { name: /LOT-2024-0001/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Producto p1: 4 u\. a 48\.50/)).toBeInTheDocument();
  });

  it('shows an empty receipt history message when there are no receipts', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(
      buildPurchaseOrder({ receipts: [] })
    );

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByText('Todavía no se registraron recepciones.')
      ).toBeInTheDocument()
    );
  });

  it('shows a loading state while fetching', () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(purchaseOrder);

    renderDetailPage();

    expect(screen.getByText('Cargando orden de compra…')).toBeInTheDocument();
  });

  it('shows the not-found block with a return link on 404', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({
          message: 'Purchase order not found',
          errorCode: 'PURCHASE_ORDER_NOT_FOUND',
        }),
      };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByText('La orden de compra no existe o fue eliminada.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a órdenes de compra' })
    ).toHaveAttribute('href', '/purchase-orders');
  });

  it('shows a denied view when the request is forbidden', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return { ok: false, status: 403, json: async () => ({}) };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByText('No tenés permiso para ver esta orden de compra.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a órdenes de compra' })
    ).toHaveAttribute('href', '/purchase-orders');
  });

  it('shows a Spanish error state on other failures', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/users/me')) {
        return { ok: true, json: async () => adminUser };
      }
      return { ok: false, status: 500, json: async () => ({}) };
    });

    renderDetailPage();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos'
      )
    );
  });

  it('renders the role-gated actions for an Admin on a draft order', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrder(purchaseOrder);

    renderDetailPage();

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Confirmar orden' })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: 'Cancelar orden' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/purchase-orders/po1/edit'
    );
  });
});

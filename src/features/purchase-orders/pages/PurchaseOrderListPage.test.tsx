import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import type { PurchaseOrderListResponse } from '../types';
import { PurchaseOrderListPage } from './PurchaseOrderListPage';

const purchaseOrder = buildPurchaseOrder();

const paginatedResponse: PurchaseOrderListResponse = {
  data: [purchaseOrder],
  meta: { page: 1, limit: 10, total: 1 },
};

const multiPageResponse: PurchaseOrderListResponse = {
  data: [purchaseOrder],
  meta: { page: 1, limit: 10, total: 25 },
};

const suppliersResponse = [{ id: 'sup1', name: 'Repuestos SA' }];

function mockFetchWithPurchaseOrders(response: object) {
  return vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/suppliers')) {
      return { ok: true, json: async () => suppliersResponse };
    }
    return { ok: true, json: async () => response };
  });
}

function createWrapper(initialEntries?: string[]) {
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

function lastPurchaseOrdersUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  const purchaseOrderCalls = fetchMock.mock.calls.filter((call) =>
    String(call[0]).includes('/purchase-orders')
  );
  const [url] = purchaseOrderCalls.at(-1) as [string];
  return new URL(url);
}

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders rows with the total and the status badge', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrders(multiPageResponse);

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'COM-2024-000001' })
      ).toBeInTheDocument()
    );

    for (const column of [
      'N° Orden',
      'Fecha',
      'Proveedor',
      'Total estimado',
      'Estado',
      'Acciones',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: column })
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole('cell', { name: 'Repuestos SA' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '500.00' })).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /COM-2024-000001/ });
    expect(within(row).getByText('Borrador')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });

  it('shows a loading state and then the table', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrders(paginatedResponse);

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando órdenes de compra…')).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'COM-2024-000001' })
      ).toBeInTheDocument()
    );
  });

  it('shows an empty state when there are no purchase orders', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrders({
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    });

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByText('No se encontraron órdenes de compra.')
      ).toBeInTheDocument()
    );
  });

  it('shows a Spanish error state when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/suppliers')) {
        return { ok: true, json: async () => suppliersResponse };
      }
      return { ok: false, status: 500 };
    });

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar las órdenes de compra'
      )
    );
  });

  it('syncs the number filter to the URL and resets the page', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithPurchaseOrders(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<PurchaseOrderListPage />, {
      wrapper: createWrapper(['/purchase-orders?page=2']),
    });

    await waitFor(() =>
      expect(
        screen.queryByText('Cargando órdenes de compra…')
      ).not.toBeInTheDocument()
    );
    expect(lastPurchaseOrdersUrl(fetchMock).searchParams.get('page')).toBe('2');

    await testUser.type(
      screen.getByRole('searchbox', { name: 'Buscar órdenes de compra' }),
      'COM-0001'
    );

    await waitFor(() => {
      const url = lastPurchaseOrdersUrl(fetchMock);
      expect(url.searchParams.get('purchaseOrderNumber')).toBe('COM-0001');
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('drives supplierId and status params from the selects', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithPurchaseOrders(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.queryByText('Cargando órdenes de compra…')
      ).not.toBeInTheDocument()
    );

    await testUser.selectOptions(
      screen.getByRole('combobox', { name: 'Proveedor' }),
      'sup1'
    );
    await testUser.selectOptions(
      screen.getByRole('combobox', { name: 'Estado' }),
      'ordered'
    );

    await waitFor(() => {
      const url = lastPurchaseOrdersUrl(fetchMock);
      expect(url.searchParams.get('supplierId')).toBe('sup1');
      expect(url.searchParams.get('status')).toBe('ordered');
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('reads initial filters from the URL', async () => {
    const fetchMock = mockFetchWithPurchaseOrders(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<PurchaseOrderListPage />, {
      wrapper: createWrapper([
        '/purchase-orders?purchaseOrderNumber=COM-0001&status=received&page=2',
      ]),
    });

    expect(
      screen.getByRole('searchbox', { name: 'Buscar órdenes de compra' })
    ).toHaveValue('COM-0001');

    await waitFor(() => {
      const url = lastPurchaseOrdersUrl(fetchMock);
      expect(url.searchParams.get('purchaseOrderNumber')).toBe('COM-0001');
      expect(url.searchParams.get('status')).toBe('received');
      expect(url.searchParams.get('page')).toBe('2');
    });
  });

  it('ignores an invalid status in the URL', async () => {
    const fetchMock = mockFetchWithPurchaseOrders(paginatedResponse);
    globalThis.fetch = fetchMock;

    render(<PurchaseOrderListPage />, {
      wrapper: createWrapper(['/purchase-orders?status=bogus']),
    });

    await waitFor(() =>
      expect(
        lastPurchaseOrdersUrl(fetchMock).searchParams.get('status')
      ).toBeNull()
    );
  });

  it('navigates to the next page', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithPurchaseOrders(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );

    await testUser.click(
      screen.getByRole('button', { name: 'Página siguiente' })
    );

    await waitFor(() =>
      expect(lastPurchaseOrdersUrl(fetchMock).searchParams.get('page')).toBe(
        '2'
      )
    );
  });

  it('links each row to the purchase order detail', async () => {
    globalThis.fetch = mockFetchWithPurchaseOrders(paginatedResponse);

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ver/i })).toHaveAttribute(
        'href',
        '/purchase-orders/po1'
      )
    );
  });

  it('links the header button to the create page', () => {
    globalThis.fetch = mockFetchWithPurchaseOrders(paginatedResponse);

    render(<PurchaseOrderListPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /nueva orden/i })).toHaveAttribute(
      'href',
      '/purchase-orders/new'
    );
  });
});

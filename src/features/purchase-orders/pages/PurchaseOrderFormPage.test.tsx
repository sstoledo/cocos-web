import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder, buildPurchaseOrderLine } from '../test/fixtures';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderFormPage } from './PurchaseOrderFormPage';

const API = 'http://localhost:3000/api';

const suppliers = [{ id: 'sup1', name: 'Repuestos SA' }];

const products = [
  {
    id: 'p1',
    code: 'PRD-001',
    name: 'Filtro de aceite',
    price: '25.00',
    isActive: true,
    presentation: { id: 'pres1', name: 'Unidad' },
    brand: { id: 'b1', name: 'Genérica' },
    category: { id: 'c1', name: 'Filtros' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    code: 'PRD-002',
    name: 'Filtro de aire',
    price: '40.00',
    isActive: true,
    presentation: { id: 'pres1', name: 'Unidad' },
    brand: { id: 'b1', name: 'Genérica' },
    category: { id: 'c1', name: 'Filtros' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const draftOrder = buildPurchaseOrder({
  notes: 'Pedido mensual',
  lines: [
    buildPurchaseOrderLine({
      id: 'line1',
      productId: 'p1',
      quantityOrdered: 10,
      estimatedCostPrice: '50.00',
    }),
  ],
});

type MockBehavior = {
  purchaseOrder?: PurchaseOrder;
  createStatus?: number;
  createBody?: unknown;
  updateStatus?: number;
  updateBody?: unknown;
};

function mockFetch(behavior: MockBehavior = {}) {
  const created = buildPurchaseOrder({ id: 'po-new' });

  return vi.fn((url: string, init?: RequestInit) => {
    if (url === `${API}/suppliers`) {
      return Promise.resolve({ ok: true, json: async () => suppliers });
    }

    if (url === `${API}/products`) {
      return Promise.resolve({ ok: true, json: async () => products });
    }

    if (url === `${API}/purchase-orders` && init?.method === 'POST') {
      if (behavior.createStatus && behavior.createStatus >= 400) {
        return Promise.resolve({
          ok: false,
          status: behavior.createStatus,
          json: async () => behavior.createBody ?? {},
        });
      }
      return Promise.resolve({ ok: true, json: async () => created });
    }

    if (url === `${API}/purchase-orders/po1` && init?.method === 'PATCH') {
      if (behavior.updateStatus && behavior.updateStatus >= 400) {
        return Promise.resolve({
          ok: false,
          status: behavior.updateStatus,
          json: async () => behavior.updateBody ?? {},
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => behavior.purchaseOrder ?? draftOrder,
      });
    }

    if (url === `${API}/purchase-orders/po1`) {
      return Promise.resolve({
        ok: true,
        json: async () => behavior.purchaseOrder ?? draftOrder,
      });
    }

    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function createWrapper(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: [initialEntry] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/purchase-orders/new',
            element: children,
          }),
          createElement(Route, {
            path: '/purchase-orders/:id/edit',
            element: children,
          }),
          createElement(Route, {
            path: '/purchase-orders/:id',
            element: createElement(LocationDisplay),
          }),
          createElement(Route, {
            path: '/purchase-orders',
            element: createElement(LocationDisplay),
          })
        )
      )
    );
  };
}

async function fillValidCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Proveedor'), 'sup1');
  await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
  await user.clear(screen.getByLabelText('Cantidad'));
  await user.type(screen.getByLabelText('Cantidad'), '10');
  await user.type(screen.getByLabelText('Costo estimado'), '50.00');
}

describe('PurchaseOrderFormPage — create mode', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the supplier select and an initial product line', async () => {
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );
    expect(
      screen.getByRole('heading', { name: 'Nueva orden de compra' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
    expect(screen.getByLabelText('Costo estimado')).toBeInTheDocument();
  });

  it('shows a loading state while catalogs load', () => {
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    expect(screen.getByText('Cargando catálogos…')).toBeInTheDocument();
  });

  it('adds and removes product lines', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Producto')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Agregar producto' }));
    expect(screen.getAllByLabelText('Producto')).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);
    expect(screen.getAllByLabelText('Producto')).toHaveLength(1);
  });

  it('shows the line subtotal and total from cents arithmetic', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Producto')).toBeInTheDocument()
    );

    await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '10');
    await user.type(screen.getByLabelText('Costo estimado'), '50.00');

    await waitFor(() =>
      expect(screen.getByText('Subtotal: 500.00')).toBeInTheDocument()
    );
    expect(screen.getByText('Total estimado: 500.00')).toBeInTheDocument();
  });

  it('shows validation errors when submitting the empty form', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(screen.getByText('Seleccioná un proveedor')).toBeInTheDocument()
    );
    expect(screen.getByText('Seleccioná un producto')).toBeInTheDocument();
    expect(
      screen.getByText('El precio de costo es requerido')
    ).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalledWith(
      `${API}/purchase-orders`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('rejects money with more than 2 decimals', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await user.selectOptions(screen.getByLabelText('Proveedor'), 'sup1');
    await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
    await user.type(screen.getByLabelText('Costo estimado'), '10.999');
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(
        screen.getByText('Ingresá un monto válido (hasta 2 decimales)')
      ).toBeInTheDocument()
    );
  });

  it('rejects duplicate products across lines', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await user.selectOptions(screen.getByLabelText('Proveedor'), 'sup1');
    await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
    await user.type(screen.getByLabelText('Costo estimado'), '50.00');

    await user.click(screen.getByRole('button', { name: 'Agregar producto' }));
    const productSelects = screen.getAllByLabelText('Producto');
    await user.selectOptions(productSelects[1], 'p1');
    await user.type(screen.getAllByLabelText('Costo estimado')[1], '10.00');

    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(
        screen.getByText('No podés cargar el mismo producto dos veces.')
      ).toBeInTheDocument()
    );
  });

  it('requires at least one line', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await user.selectOptions(screen.getByLabelText('Proveedor'), 'sup1');
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(
        screen.getByText('Agregá al menos un producto a la orden')
      ).toBeInTheDocument()
    );
  });

  it('submits the create payload and navigates to the detail page', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await fillValidCreateForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        `${API}/purchase-orders`,
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
    );

    const postCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === `${API}/purchase-orders` &&
        (call[1] as RequestInit).method === 'POST'
    );
    const body = JSON.parse((postCall?.[1] as RequestInit).body as string);

    expect(body).toEqual({
      supplierId: 'sup1',
      lines: [
        { productId: 'p1', quantityOrdered: 10, estimatedCostPrice: '50.00' },
      ],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/purchase-orders/po-new'
      )
    );
  });

  it('shows the mapped API error when the create fails', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch({
      createStatus: 404,
      createBody: {
        message: 'Supplier not found',
        errorCode: 'SUPPLIER_NOT_FOUND',
      },
    });

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/new'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
    );

    await fillValidCreateForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El proveedor seleccionado no existe o está inactivo.'
      )
    );
  });
});

describe('PurchaseOrderFormPage — edit mode', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefills the draft lines and submits a full-replace PATCH', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch();

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/po1/edit'),
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: 'Editar orden COM-2024-000001',
        })
      ).toBeInTheDocument()
    );

    expect(screen.getByLabelText('Proveedor')).toHaveValue('sup1');
    expect(screen.getByLabelText('Proveedor')).toBeDisabled();
    expect(screen.getByLabelText('Producto')).toHaveValue('p1');
    expect(screen.getByLabelText('Cantidad')).toHaveValue(10);
    expect(screen.getByLabelText('Costo estimado')).toHaveValue('50.00');

    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '12');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        `${API}/purchase-orders/po1`,
        expect.objectContaining({ method: 'PATCH' })
      )
    );

    const patchCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === `${API}/purchase-orders/po1` &&
        (call[1] as RequestInit).method === 'PATCH'
    );
    const body = JSON.parse((patchCall?.[1] as RequestInit).body as string);

    // Full-replace: the complete line set goes in the PATCH body, money
    // stays a decimal string verbatim.
    expect(body).toEqual({
      lines: [
        { productId: 'p1', quantityOrdered: 12, estimatedCostPrice: '50.00' },
      ],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/purchase-orders/po1'
      )
    );
  });

  it('shows a blocked state with a link back when the order is not draft', async () => {
    globalThis.fetch = mockFetch({
      purchaseOrder: buildPurchaseOrder({ status: 'ordered' }),
    });

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/po1/edit'),
    });

    await waitFor(() =>
      expect(
        screen.getByText('Solo se pueden editar órdenes en borrador.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a la orden' })
    ).toHaveAttribute('href', '/purchase-orders/po1');
    expect(
      screen.queryByRole('button', { name: 'Guardar cambios' })
    ).not.toBeInTheDocument();
  });

  it('shows the mapped API error when the update fails', async () => {
    const user = userEvent.setup();
    globalThis.fetch = mockFetch({
      updateStatus: 409,
      updateBody: {
        message: 'Purchase order is not draft',
        errorCode: 'PO_NOT_DRAFT',
      },
    });

    render(<PurchaseOrderFormPage />, {
      wrapper: createWrapper('/purchase-orders/po1/edit'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Producto')).toHaveValue('p1')
    );

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Solo se pueden editar órdenes en borrador.'
      )
    );
  });
});

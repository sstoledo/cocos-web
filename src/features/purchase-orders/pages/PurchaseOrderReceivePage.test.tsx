import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder, buildPurchaseOrderLine } from '../test/fixtures';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderReceivePage } from './PurchaseOrderReceivePage';

const API = 'http://localhost:3000/api';

const partialLine = buildPurchaseOrderLine({
  id: 'line1',
  productId: 'p1',
  quantityOrdered: 10,
  quantityReceived: 4,
  estimatedCostPrice: '50.00',
});

const orderedOrder = buildPurchaseOrder({
  status: 'ordered',
  lines: [partialLine],
});

type MockBehavior = {
  purchaseOrder?: PurchaseOrder;
  receiveStatus?: number;
  receiveBody?: unknown;
};

function mockFetch(behavior: MockBehavior = {}) {
  const received = {
    ...buildPurchaseOrder({ status: 'partially_received' }),
    lotIds: ['lot-1'],
  };

  return vi.fn((url: string, init?: RequestInit) => {
    if (
      url === `${API}/purchase-orders/po1/receive` &&
      init?.method === 'POST'
    ) {
      if (behavior.receiveStatus && behavior.receiveStatus >= 400) {
        return Promise.resolve({
          ok: false,
          status: behavior.receiveStatus,
          json: async () => behavior.receiveBody ?? {},
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => behavior.receiveBody ?? received,
      });
    }

    if (url === `${API}/purchase-orders/po1`) {
      return Promise.resolve({
        ok: true,
        json: async () => behavior.purchaseOrder ?? orderedOrder,
      });
    }

    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  }) as unknown as typeof fetch;
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
            path: '/purchase-orders/:id/receive',
            element: children,
          })
        )
      )
    );
  };
}

function renderPage(behavior: MockBehavior = {}) {
  globalThis.fetch = mockFetch(behavior);
  return render(<PurchaseOrderReceivePage />, {
    wrapper: createWrapper('/purchase-orders/po1/receive'),
  });
}

// jsdom date inputs do not emulate keystrokes; change the value directly.
function setDate(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

describe('PurchaseOrderReceivePage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders receivable lines with ordered/received/remaining quantities', async () => {
    renderPage({
      purchaseOrder: buildPurchaseOrder({
        status: 'partially_received',
        lines: [
          partialLine,
          buildPurchaseOrderLine({
            id: 'line2',
            productId: 'p2',
            quantityOrdered: 5,
            quantityReceived: 0,
            estimatedCostPrice: '40.00',
            product: { id: 'p2', code: 'PRD-002', name: 'Filtro de aire' },
          }),
        ],
      }),
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: 'Recibir orden COM-2024-000001',
        })
      ).toBeInTheDocument()
    );

    expect(
      screen.getByText('Pedidas: 10 — Recibidas: 4 — Pendientes: 6')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pedidas: 5 — Recibidas: 0 — Pendientes: 5')
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText('Cantidad a recibir')).toHaveLength(2);
  });

  it('does not render inputs for fully received lines', async () => {
    renderPage({
      purchaseOrder: buildPurchaseOrder({
        status: 'partially_received',
        lines: [
          partialLine,
          buildPurchaseOrderLine({
            id: 'line2',
            productId: 'p2',
            quantityOrdered: 5,
            quantityReceived: 5,
            estimatedCostPrice: '40.00',
            product: { id: 'p2', code: 'PRD-002', name: 'Filtro de aire' },
          }),
        ],
      }),
    });

    await waitFor(() =>
      expect(
        screen.getByText('Recibida completa — 5 de 5 unidades.')
      ).toBeInTheDocument()
    );

    // Only the partially received line is editable.
    expect(screen.getAllByLabelText('Cantidad a recibir')).toHaveLength(1);
  });

  it('prefills quantity with the remainder and cost with the estimated price', async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Cantidad a recibir')).toHaveValue(6)
    );
    expect(screen.getByLabelText('Costo real')).toHaveValue('50.00');
  });

  it('rejects a quantity above the remaining', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Cantidad a recibir')).toBeInTheDocument()
    );

    await user.clear(screen.getByLabelText('Cantidad a recibir'));
    await user.type(screen.getByLabelText('Cantidad a recibir'), '10');
    await user.click(
      screen.getByRole('button', { name: 'Registrar recepción' })
    );

    await waitFor(() =>
      expect(
        screen.getByText('Máximo 6 (lo pendiente de la línea)')
      ).toBeInTheDocument()
    );
    expect(globalThis.fetch).not.toHaveBeenCalledWith(
      `${API}/purchase-orders/po1/receive`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('requires an expiration date per line', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Cantidad a recibir')).toBeInTheDocument()
    );

    await user.click(
      screen.getByRole('button', { name: 'Registrar recepción' })
    );

    await waitFor(() =>
      expect(
        screen.getByText('La fecha de vencimiento es requerida')
      ).toBeInTheDocument()
    );
    expect(globalThis.fetch).not.toHaveBeenCalledWith(
      `${API}/purchase-orders/po1/receive`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('rejects money with more than 2 decimals', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Costo real')).toBeInTheDocument()
    );

    await user.clear(screen.getByLabelText('Costo real'));
    await user.type(screen.getByLabelText('Costo real'), '10.999');
    setDate(screen.getByLabelText('Fecha de vencimiento'), '2026-12-31');
    await user.click(
      screen.getByRole('button', { name: 'Registrar recepción' })
    );

    await waitFor(() =>
      expect(
        screen.getByText('Ingresá un monto válido (hasta 2 decimales)')
      ).toBeInTheDocument()
    );
  });

  it('submits the receive payload and shows the created lot info', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Fecha de vencimiento')).toBeInTheDocument()
    );

    setDate(screen.getByLabelText('Fecha de vencimiento'), '2026-12-31');
    await user.click(
      screen.getByRole('button', { name: 'Registrar recepción' })
    );

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        `${API}/purchase-orders/po1/receive`,
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
    );

    const postCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === `${API}/purchase-orders/po1/receive` &&
        (call[1] as RequestInit).method === 'POST'
    );
    const body = JSON.parse((postCall?.[1] as RequestInit).body as string);

    // B10 contract: lineId, integer receivedQty, ISO date, money as string.
    expect(body).toEqual({
      lines: [
        {
          lineId: 'line1',
          receivedQty: 6,
          expirationDate: '2026-12-31',
          actualCostPrice: '50.00',
        },
      ],
    });

    await waitFor(() =>
      expect(
        screen.getByText('Recepción registrada correctamente.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText('Se generaron 1 lote(s) para esta orden.')
    ).toBeInTheDocument();
    expect(screen.getByText(/COM-2024-000001-R1/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver a la orden' })
    ).toHaveAttribute('href', '/purchase-orders/po1');
  });

  it.each(['draft', 'received', 'cancelled'] as const)(
    'shows a blocked state for a %s order',
    async (status) => {
      renderPage({
        purchaseOrder: buildPurchaseOrder({ status }),
      });

      await waitFor(() =>
        expect(
          screen.getByText('Esta orden no puede recibir mercadería.')
        ).toBeInTheDocument()
      );
      expect(
        screen.getByRole('link', { name: 'Volver a la orden' })
      ).toHaveAttribute('href', '/purchase-orders/po1');
      expect(
        screen.queryByRole('button', { name: 'Registrar recepción' })
      ).not.toBeInTheDocument();
    }
  );

  it('shows the mapped error on a PO_RECEIVE_OVERSHOOT 409', async () => {
    const user = userEvent.setup();
    renderPage({
      receiveStatus: 409,
      receiveBody: {
        message: 'Receive quantity overshoots pending quantity',
        errorCode: 'PO_RECEIVE_OVERSHOOT',
      },
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Fecha de vencimiento')).toBeInTheDocument()
    );

    setDate(screen.getByLabelText('Fecha de vencimiento'), '2026-12-31');
    await user.click(
      screen.getByRole('button', { name: 'Registrar recepción' })
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'La cantidad recibida supera lo pendiente de alguna línea.'
      )
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWorkOrder } from '../test/fixtures';
import type { WorkOrder, WorkOrderPayment } from '../types';
import { WorkOrderPaymentsSection } from './WorkOrderPaymentsSection';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const payment: WorkOrderPayment = {
  id: 'p1',
  workOrderId: 'wo1',
  amount: '100.00',
  paymentMethod: 'cash',
  note: 'Seña',
  paidAt: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

function renderSection(
  workOrder: WorkOrder,
  options: { canManage?: boolean; paymentsResponse?: object } = {}
) {
  const { canManage = true, paymentsResponse = [] } = options;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const postCalls: { url: string; body: unknown }[] = [];

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (init?.method === 'POST') {
        postCalls.push({ url, body: JSON.parse(init.body as string) });
        return {
          ok: true,
          status: 201,
          json: async () => payment,
        } as Response;
      }

      return { ok: true, json: async () => paymentsResponse } as Response;
    }
  );

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  }

  render(
    <WorkOrderPaymentsSection workOrder={workOrder} canManage={canManage} />,
    { wrapper: Wrapper }
  );

  return { postCalls };
}

describe('WorkOrderPaymentsSection', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('shows the payment status badge, totals and empty state', async () => {
    renderSection(
      buildWorkOrder({ paidAmount: '0.00', paymentStatus: 'pending' })
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(
      screen.getByText(/Pagado 0\.00 de 300\.00 · Saldo 300\.00/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No hay pagos registrados.')
    ).toBeInTheDocument();
  });

  it('lists the payments with date, method, amount and note', async () => {
    renderSection(
      buildWorkOrder({ paidAmount: '100.00', paymentStatus: 'partial' }),
      { paymentsResponse: [payment] }
    );

    expect(await screen.findByText('Parcial')).toBeInTheDocument();
    expect(
      screen.getByText(/Pagado 100\.00 de 300\.00 · Saldo 200\.00/)
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('cell', { name: 'Efectivo' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('cell', { name: '100.00' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('cell', { name: 'Seña' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: new Date(payment.paidAt).toLocaleString('es-AR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
      })
    ).toBeInTheDocument();
  });

  it('registers a payment from the dialog', async () => {
    const { postCalls } = renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar pago' })
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Saldo restante: 300.00');

    await user.type(within(dialog).getByLabelText('Monto'), '100.00');
    await user.selectOptions(
      within(dialog).getByLabelText('Método de pago'),
      'cash'
    );
    await user.type(within(dialog).getByLabelText('Nota (opcional)'), 'Seña');
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar pago' })
    );

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].url).toBe(
      'http://localhost:3000/api/work-orders/wo1/payments'
    );
    expect(postCalls[0].body).toEqual({
      amount: 100,
      paymentMethod: 'cash',
      note: 'Seña',
    });
  });

  it('validates that the amount does not exceed the remaining balance', async () => {
    const { postCalls } = renderSection(
      buildWorkOrder({ paidAmount: '250.00', paymentStatus: 'partial' })
    );
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar pago' })
    );

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Monto'), '60.00');
    await user.selectOptions(
      within(dialog).getByLabelText('Método de pago'),
      'cash'
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar pago' })
    );

    expect(
      await within(dialog).findByText(
        'El monto no puede superar el saldo restante (50.00)'
      )
    ).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  it('shows the mapped overpayment error from the backend', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    globalThis.fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return {
            ok: false,
            status: 400,
            json: async () => ({
              message: 'Payment of 300 exceeds remaining balance 250.00',
              errorCode: 'WORK_ORDER_OVERPAYMENT',
            }),
          } as Response;
        }
        return { ok: true, json: async () => [] } as Response;
      }
    );

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    // Disable the client-side guard by making the backend stricter than the
    // form (order total is high, server balance is lower).
    render(
      <WorkOrderPaymentsSection
        workOrder={buildWorkOrder({ totalAmount: '1000.00' })}
        canManage={true}
      />,
      { wrapper: Wrapper }
    );
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar pago' })
    );
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Monto'), '300.00');
    await user.selectOptions(
      within(dialog).getByLabelText('Método de pago'),
      'cash'
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar pago' })
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'El monto supera el saldo restante de la orden (saldo: 250.00).'
    );
  });

  it('hides the register button for roles without permission', () => {
    renderSection(buildWorkOrder(), { canManage: false });

    expect(
      screen.queryByRole('button', { name: 'Registrar pago' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('hides the register button on a cancelled order', () => {
    renderSection(buildWorkOrder({ status: 'cancelled' }));

    expect(
      screen.queryByRole('button', { name: 'Registrar pago' })
    ).not.toBeInTheDocument();
  });

  it('hides the register button when the order is fully paid', () => {
    renderSection(
      buildWorkOrder({ paidAmount: '300.00', paymentStatus: 'paid' })
    );

    expect(
      screen.queryByRole('button', { name: 'Registrar pago' })
    ).not.toBeInTheDocument();
  });

  it('shows an error when the payments request fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );
    }

    render(
      <WorkOrderPaymentsSection
        workOrder={buildWorkOrder()}
        canManage={true}
      />,
      { wrapper: Wrapper }
    );

    expect(
      await screen.findByText(
        'No se pudieron cargar los pagos. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });
});

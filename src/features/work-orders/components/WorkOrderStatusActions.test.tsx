import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWorkOrder, buildWorkOrderProductLine } from '../test/fixtures';
import type { WorkOrder, WorkOrderStatus } from '../types';
import { WorkOrderStatusActions } from './WorkOrderStatusActions';

const adminUser = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@example.com',
  role: { id: 'r1', name: 'Admin' },
};

function renderActions({
  user = adminUser,
  status = 'pending',
  products = [] as WorkOrder['products'],
  patchResponse,
}: {
  user?: unknown;
  status?: WorkOrderStatus;
  products?: WorkOrder['products'];
  patchResponse?: { ok: boolean; status?: number; body: object };
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const patchCalls: { url: string; body: unknown }[] = [];
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/users/me')) {
        return { ok: true, json: async () => user } as Response;
      }

      if (init?.method === 'PATCH') {
        patchCalls.push({
          url,
          body: JSON.parse(init.body as string),
        });
        const response = patchResponse ?? {
          ok: true,
          body: buildWorkOrder({ status: 'in_progress' }),
        };
        return {
          ok: response.ok,
          status: response.status ?? (response.ok ? 200 : 409),
          json: async () => response.body,
        } as Response;
      }

      return { ok: true, json: async () => ({}) } as Response;
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
    createElement(WorkOrderStatusActions, {
      orderId: 'wo1',
      status,
      products,
    }),
    { wrapper: Wrapper }
  );

  return { patchCalls, invalidateQueriesSpy };
}

describe('WorkOrderStatusActions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('S1: shows Iniciar trabajo and Cancelar orden for a pending order (Admin)', async () => {
    renderActions({ status: 'pending' });

    expect(
      await screen.findByRole('button', { name: 'Iniciar trabajo' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar orden' })
    ).toBeInTheDocument();
  });

  it('S2: shows Marcar como terminada and Cancelar orden for an in_progress order (Mechanic)', async () => {
    renderActions({
      status: 'in_progress',
      user: { ...adminUser, role: { id: 'r3', name: 'Mechanic' } },
    });

    expect(
      await screen.findByRole('button', { name: 'Marcar como terminada' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar orden' })
    ).toBeInTheDocument();
  });

  it.each(['done', 'cancelled'] as WorkOrderStatus[])(
    'S3: shows no transition buttons for the terminal status %s',
    async (status) => {
      renderActions({ status });

      await waitFor(() =>
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      );
    }
  );

  it('S4: shows no buttons for a role outside Admin/Reception/Mechanic', async () => {
    renderActions({
      status: 'pending',
      user: { ...adminUser, role: { id: 'r9', name: 'Viewer' } },
    });

    await waitFor(() =>
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    );
  });

  it('S5: fires the PATCH without a confirm dialog for pending → in_progress', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const { patchCalls } = renderActions({ status: 'pending' });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Iniciar trabajo' })
    );

    expect(confirmSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].url).toBe(
      'http://localhost:3000/api/work-orders/wo1/status'
    );
    expect(patchCalls[0].body).toEqual({ status: 'in_progress' });
  });

  it('S6: fires the PATCH only after accepting the confirm for done', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { patchCalls } = renderActions({ status: 'in_progress' });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Marcar como terminada' })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Marcar la orden como terminada? Se descontará el stock de los productos.'
    );
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].body).toEqual({ status: 'done' });
  });

  it('S6: does not fire the PATCH when the done confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { patchCalls } = renderActions({ status: 'in_progress' });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Marcar como terminada' })
    );

    expect(window.confirm).toHaveBeenCalled();
    expect(patchCalls).toHaveLength(0);
  });

  it('S7: fires the PATCH only after accepting the confirm for cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { patchCalls } = renderActions({ status: 'pending' });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Cancelar orden' })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Cancelar esta orden? Esta acción es irreversible.'
    );
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].body).toEqual({ status: 'cancelled' });
  });

  it('S7: does not fire the PATCH when the cancel confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { patchCalls } = renderActions({ status: 'pending' });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Cancelar orden' })
    );

    expect(window.confirm).toHaveBeenCalled();
    expect(patchCalls).toHaveLength(0);
  });

  it('S8: disables all buttons and shows the loading label during the mutation', async () => {
    renderActions({ status: 'pending' });
    globalThis.fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes('/users/me')) {
          return { ok: true, json: async () => adminUser } as Response;
        }
        if (init?.method === 'PATCH') {
          return new Promise<Response>(() => {});
        }
        return { ok: true, json: async () => ({}) } as Response;
      }
    );
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Iniciar trabajo' })
    );

    const activeButton = await screen.findByRole('button', {
      name: 'Iniciando…',
    });
    expect(activeButton).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Cancelar orden' })
    ).toBeDisabled();
  });

  it('S9: shows the already-changed message and refetches the detail on INVALID_STATUS_TRANSITION', async () => {
    const { invalidateQueriesSpy } = renderActions({
      status: 'pending',
      patchResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'Invalid transition',
          errorCode: 'INVALID_STATUS_TRANSITION',
        },
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Iniciar trabajo' })
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El estado de la orden ya cambió. Actualizamos los datos.'
      )
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['work-order', 'wo1'],
    });
  });

  it('S10: names the product from the loaded lines on INSUFFICIENT_STOCK', async () => {
    const line = buildWorkOrderProductLine({
      productId: 'prod1',
      product: {
        id: 'prod1',
        code: 'PRD-01',
        name: 'Filtro de aceite',
        description: null,
        price: '80.50',
      },
    });
    renderActions({
      status: 'in_progress',
      products: [line],
      patchResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'Insufficient stock',
          errorCode: 'INSUFFICIENT_STOCK',
          details: [{ productId: 'prod1', requested: 3, available: 1 }],
        },
      },
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Marcar como terminada' })
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No hay stock suficiente de PRD-01 Filtro de aceite para completar la orden.'
      )
    );
  });

  it('S12: shows the generic fallback message on unknown errors', async () => {
    renderActions({
      status: 'pending',
      patchResponse: {
        ok: false,
        status: 500,
        body: { message: 'Internal server error' },
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Iniciar trabajo' })
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo guardar la orden. Intentá de nuevo más tarde.'
      )
    );
  });
});

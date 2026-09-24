import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPurchaseOrder } from '../test/fixtures';
import type { PurchaseOrder } from '../types';
import { PurchaseOrderActions } from './PurchaseOrderActions';

const adminUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const purchasingUser = { ...adminUser, role: { id: 'r2', name: 'Purchasing' } };

const warehouseUser = { ...adminUser, role: { id: 'r3', name: 'Warehouse' } };

const receptionUser = { ...adminUser, role: { id: 'r4', name: 'Reception' } };

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

function renderActions({
  user = adminUser,
  purchaseOrder = buildPurchaseOrder(),
  patchResponse,
}: {
  user?: unknown;
  purchaseOrder?: PurchaseOrder;
  patchResponse?: { ok: boolean; status?: number; body: object };
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const patchCalls: { url: string; init?: RequestInit }[] = [];

  useUserMock.mockReturnValue({ user, isLoading: false, error: null });

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (init?.method === 'PATCH') {
        patchCalls.push({ url, init });
        const response = patchResponse ?? {
          ok: true,
          body: buildPurchaseOrder({ status: 'ordered' }),
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
      MemoryRouter,
      {},
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  }

  render(createElement(PurchaseOrderActions, { purchaseOrder }), {
    wrapper: Wrapper,
  });

  return { patchCalls };
}

describe('PurchaseOrderActions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    useUserMock.mockReset();
  });

  it.each([
    ['Admin', adminUser],
    ['Purchasing', purchasingUser],
  ])(
    'shows confirm, cancel and edit for %s on a draft order',
    (_role, user) => {
      renderActions({
        user,
        purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
      });

      expect(
        screen.getByRole('button', { name: 'Confirmar orden' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancelar orden' })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
        'href',
        '/purchase-orders/po1/edit'
      );
      expect(
        screen.queryByRole('link', { name: 'Registrar recepción' })
      ).not.toBeInTheDocument();
    }
  );

  it('shows cancel and receive for an ordered order', () => {
    renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'ordered' }),
    });

    expect(
      screen.getByRole('button', { name: 'Cancelar orden' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Registrar recepción' })
    ).toHaveAttribute('href', '/purchase-orders/po1/receive');
    expect(
      screen.queryByRole('button', { name: 'Confirmar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Editar' })
    ).not.toBeInTheDocument();
  });

  it('shows only receive for a partially received order', () => {
    renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'partially_received' }),
    });

    expect(
      screen.getByRole('link', { name: 'Registrar recepción' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirmar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Editar' })
    ).not.toBeInTheDocument();
  });

  it.each(['received', 'cancelled'] as const)(
    'shows no actions for a %s order',
    (status) => {
      renderActions({ purchaseOrder: buildPurchaseOrder({ status }) });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    }
  );

  it('shows receive but not confirm/cancel for Warehouse on an ordered order', () => {
    renderActions({
      user: warehouseUser,
      purchaseOrder: buildPurchaseOrder({ status: 'ordered' }),
    });

    expect(
      screen.getByRole('link', { name: 'Registrar recepción' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirmar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar orden' })
    ).not.toBeInTheDocument();
  });

  it('shows no actions for Warehouse on a draft order', () => {
    renderActions({
      user: warehouseUser,
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });

    expect(
      screen.queryByRole('button', { name: 'Confirmar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Editar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Registrar recepción' })
    ).not.toBeInTheDocument();
  });

  it('shows no actions for Reception on a draft order', () => {
    renderActions({
      user: receptionUser,
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });

    expect(
      screen.queryByRole('button', { name: 'Confirmar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancelar orden' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Editar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Registrar recepción' })
    ).not.toBeInTheDocument();
  });

  it('fires a no-body PATCH to /order only after confirm accept', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { patchCalls } = renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Confirmar orden' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Confirmar la orden COM-2024-000001? Se notificará al proveedor.'
    );
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].url).toBe(
      'http://localhost:3000/api/purchase-orders/po1/order'
    );
    expect(patchCalls[0].init?.body).toBeUndefined();
  });

  it('does not fire the order mutation when confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { patchCalls } = renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Confirmar orden' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(patchCalls).toHaveLength(0);
  });

  it('fires a no-body PATCH to /cancel only after confirm accept', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { patchCalls } = renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar orden' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Cancelar la orden COM-2024-000001? Esta acción no se puede deshacer.'
    );
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].url).toBe(
      'http://localhost:3000/api/purchase-orders/po1/cancel'
    );
    expect(patchCalls[0].init?.body).toBeUndefined();
  });

  it('does not fire the cancel mutation when confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { patchCalls } = renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar orden' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(patchCalls).toHaveLength(0);
  });

  it('shows the mapped error inline when cancel fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderActions({
      purchaseOrder: buildPurchaseOrder({ status: 'draft' }),
      patchResponse: {
        ok: false,
        status: 409,
        body: { message: 'Cannot cancel', errorCode: 'PO_CANNOT_CANCEL' },
      },
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar orden' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Esta orden no se puede cancelar.'
      )
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import type { Sale } from '../types';
import { SaleCancelAction } from './SaleCancelAction';

const adminUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: { id: 'r1', name: 'Admin' },
};

const receptionUser = { ...adminUser, role: { id: 'r2', name: 'Reception' } };

const mechanicUser = { ...adminUser, role: { id: 'r3', name: 'Mechanic' } };

const useUserMock = vi.fn();

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

function renderAction({
  user = adminUser,
  sale = buildSale(),
  patchResponse,
}: {
  user?: unknown;
  sale?: Sale;
  patchResponse?: { ok: boolean; status?: number; body: object };
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const patchCalls: { url: string; init?: RequestInit }[] = [];
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

  useUserMock.mockReturnValue({
    user,
    isLoading: false,
    error: null,
  });

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (init?.method === 'PATCH') {
        patchCalls.push({ url, init });
        const response = patchResponse ?? {
          ok: true,
          body: buildSale({ status: 'cancelled' }),
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

  render(createElement(SaleCancelAction, { sale }), { wrapper: Wrapper });

  return { patchCalls, invalidateQueriesSpy };
}

describe('SaleCancelAction', () => {
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
    ['Reception', receptionUser],
  ])('S1: renders the action for %s on a completed sale', (_role, user) => {
    renderAction({ user });

    expect(
      screen.getByRole('button', { name: 'Cancelar venta' })
    ).toBeInTheDocument();
  });

  it.each([
    ['a Mechanic', { user: mechanicUser }],
    ['a cancelled sale', { sale: buildSale({ status: 'cancelled' }) }],
  ])('S1: does not render the action for %s', (_label, overrides) => {
    renderAction(overrides);

    expect(
      screen.queryByRole('button', { name: 'Cancelar venta' })
    ).not.toBeInTheDocument();
  });

  it('S2: confirms naming the sale and fires a no-body PATCH on accept', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { patchCalls } = renderAction();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Cancelar la venta VTA-2026-000001? Esta acción no se puede deshacer.'
    );
    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].url).toBe(
      'http://localhost:3000/api/sales/sale1/cancel'
    );
    expect(patchCalls[0].init?.body).toBeUndefined();
  });

  it('S2: does not fire the PATCH when the confirm is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { patchCalls } = renderAction();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(patchCalls).toHaveLength(0);
  });

  it('S3: invalidates the sales prefix and the sale detail on success', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { invalidateQueriesSpy } = renderAction();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

    await waitFor(() =>
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['sales'],
      })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sale', 'sale1'],
    });
  });

  it('S4: shows the already-cancelled message and re-invalidates on 409', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { invalidateQueriesSpy } = renderAction({
      patchResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'Sale already cancelled',
          errorCode: 'SALE_ALREADY_CANCELLED',
        },
      },
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Esta venta ya fue cancelada.'
      )
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sale', 'sale1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['sales'],
    });
  });

  it.each([
    {
      status: 404,
      body: { message: 'Sale not found', errorCode: 'SALE_NOT_FOUND' },
      expected: 'La venta no existe o fue eliminada.',
    },
    {
      status: 500,
      body: { message: 'Internal server error' },
      expected: 'No se pudo cancelar la venta. Intentá de nuevo más tarde.',
    },
  ])(
    'S5: shows the mapped message inline on %s failures',
    async ({ status, body, expected }) => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderAction({
        patchResponse: { ok: false, status, body },
      });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(expected)
      );
    }
  );

  it('S6: disables the button while the mutation is pending', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderAction();
    globalThis.fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'PATCH') {
          return new Promise<Response>(() => {});
        }
        return { ok: true, json: async () => ({}) } as Response;
      }
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar venta' }));

    expect(
      await screen.findByRole('button', { name: 'Cancelar venta' })
    ).toBeDisabled();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWorkOrder } from '../test/fixtures';
import type { ConsumptionEvent, WorkOrder } from '../types';
import { WorkOrderConsumptionsSection } from './WorkOrderConsumptionsSection';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const directProduct = {
  id: 'p1',
  code: 'COD-1',
  name: 'Filtro de aire',
  consumptionType: 'direct' as const,
};

const partialProduct = {
  id: 'p2',
  code: 'COD-2',
  name: 'Aceite 20W50',
  consumptionType: 'partial' as const,
};

const productsResponse = {
  data: [directProduct, partialProduct],
  meta: { page: 1, limit: 100, total: 2 },
};

const consumption: ConsumptionEvent = {
  id: 'ce1',
  workOrderId: 'wo1',
  productId: 'p2',
  product: partialProduct,
  type: 'opened',
  quantity: null,
  registeredById: 'u1',
  registeredBy: { id: 'u1', name: 'Ana García' },
  createdAt: '2024-01-15T10:00:00.000Z',
};

const usedConsumption: ConsumptionEvent = {
  id: 'ce2',
  workOrderId: 'wo1',
  productId: 'p1',
  product: directProduct,
  type: 'used',
  quantity: 3,
  registeredById: 'u1',
  registeredBy: { id: 'u1', name: 'Ana García' },
  createdAt: '2024-01-15T11:00:00.000Z',
};

type FetchOverrides = {
  consumptionsResponse?: object;
  openContainersResponse?: object;
  postResponse?: { ok: boolean; status: number; body: object };
};

function renderSection(
  workOrder: WorkOrder,
  options: { canRegister?: boolean } & FetchOverrides = {}
) {
  const {
    canRegister = true,
    consumptionsResponse = [],
    openContainersResponse = {
      productId: 'p2',
      openContainers: 0,
      lastOpened: null,
    },
    postResponse = { ok: true, status: 201, body: consumption },
  } = options;

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
          ok: postResponse.ok,
          status: postResponse.status,
          json: async () => postResponse.body,
        } as Response;
      }

      if (url.includes('/open-containers')) {
        return {
          ok: true,
          json: async () => openContainersResponse,
        } as Response;
      }

      if (url.includes('/products')) {
        return { ok: true, json: async () => productsResponse } as Response;
      }

      return { ok: true, json: async () => consumptionsResponse } as Response;
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
    <WorkOrderConsumptionsSection
      workOrder={workOrder}
      canRegister={canRegister}
    />,
    { wrapper: Wrapper }
  );

  return { postCalls };
}

describe('WorkOrderConsumptionsSection', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('shows the empty state when there are no consumptions', async () => {
    renderSection(buildWorkOrder());

    expect(
      await screen.findByText('No hay consumos registrados.')
    ).toBeInTheDocument();
  });

  it('lists events with translated type, product and author', async () => {
    renderSection(buildWorkOrder(), {
      consumptionsResponse: [consumption, usedConsumption],
    });

    expect(
      await screen.findByRole('cell', { name: 'Abrió envase' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Usó 3 unidad(es)' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'COD-2 — Aceite 20W50' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'Ana García' })).toHaveLength(2);
  });

  it('hides the register button when canRegister is false', () => {
    renderSection(buildWorkOrder(), { canRegister: false });

    expect(
      screen.queryByRole('button', { name: 'Registrar consumo' })
    ).not.toBeInTheDocument();
  });

  it('registers a used consumption with quantity', async () => {
    const { postCalls } = renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p1'
    );
    await user.selectOptions(within(dialog).getByLabelText('Tipo de evento'), [
      'used',
    ]);
    await user.type(within(dialog).getByLabelText('Cantidad'), '2');
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' })
    );

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].url).toBe(
      'http://localhost:3000/api/work-orders/wo1/consumptions'
    );
    expect(postCalls[0].body).toEqual({
      productId: 'p1',
      type: 'used',
      quantity: 2,
    });
  });

  it('only offers the used type for direct products', async () => {
    renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p1'
    );

    const typeSelect = within(dialog).getByLabelText('Tipo de evento');
    const options = within(typeSelect).getAllByRole('option');
    const values = options.map((option) => option.getAttribute('value'));
    expect(values).toContain('used');
    expect(values).not.toContain('opened');
    expect(values).not.toContain('depleted');
  });

  it('shows the open container warning for partial products with open containers', async () => {
    renderSection(buildWorkOrder(), {
      openContainersResponse: {
        productId: 'p2',
        openContainers: 2,
        lastOpened: {
          workOrderId: 'wo9',
          workOrderNumber: 'OT-0009',
          registeredBy: { id: 'u9', name: 'Luis Díaz' },
          createdAt: '2024-01-14T09:00:00.000Z',
        },
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p2'
    );

    expect(
      await within(dialog).findByText(/Hay 2 envase\(s\) abierto\(s\)/)
    ).toHaveTextContent('último abierto en OT-0009 por Luis Díaz');
  });

  it('does not show the warning when there are no open containers', async () => {
    renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p2'
    );

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/open-containers'),
        expect.anything()
      )
    );
    expect(
      within(dialog).queryByText(/envase\(s\) abierto\(s\)/)
    ).not.toBeInTheDocument();
  });

  it('registers an opened event without quantity', async () => {
    const { postCalls } = renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p2'
    );
    await user.selectOptions(within(dialog).getByLabelText('Tipo de evento'), [
      'opened',
    ]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' })
    );

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].body).toEqual({ productId: 'p2', type: 'opened' });
  });

  it('requires quantity for used events', async () => {
    const { postCalls } = renderSection(buildWorkOrder());
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p1'
    );
    await user.selectOptions(within(dialog).getByLabelText('Tipo de evento'), [
      'used',
    ]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' })
    );

    expect(
      await within(dialog).findByText(
        'Ingresá una cantidad válida (entero mayor a 0)'
      )
    ).toBeInTheDocument();
    expect(postCalls).toHaveLength(0);
  });

  it('maps the INSUFFICIENT_STOCK error with amounts', async () => {
    renderSection(buildWorkOrder(), {
      postResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'Insufficient stock',
          errorCode: 'INSUFFICIENT_STOCK',
          details: [{ productId: 'p1', requested: 2, available: 1 }],
        },
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p1'
    );
    await user.selectOptions(within(dialog).getByLabelText('Tipo de evento'), [
      'used',
    ]);
    await user.type(within(dialog).getByLabelText('Cantidad'), '2');
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' })
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Stock insuficiente: solicitaste 2 y hay 1 disponible(s).'
    );
  });

  it('maps the NO_OPEN_CONTAINER error', async () => {
    renderSection(buildWorkOrder(), {
      postResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'No open container',
          errorCode: 'NO_OPEN_CONTAINER',
        },
      },
    });
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Registrar consumo' })
    );

    const dialog = screen.getByRole('dialog');
    await user.selectOptions(
      await within(dialog).findByLabelText('Producto'),
      'p2'
    );
    await user.selectOptions(within(dialog).getByLabelText('Tipo de evento'), [
      'depleted',
    ]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' })
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No hay ningún envase abierto de este producto.'
    );
  });

  it('shows an error when the consumptions request fails', async () => {
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
      <WorkOrderConsumptionsSection
        workOrder={buildWorkOrder()}
        canRegister={false}
      />,
      { wrapper: Wrapper }
    );

    expect(
      await screen.findByText(
        'No se pudieron cargar los consumos. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });
});

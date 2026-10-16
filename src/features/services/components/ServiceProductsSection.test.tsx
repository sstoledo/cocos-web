import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceProduct } from '../types';
import { ServiceProductsSection } from './ServiceProductsSection';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const serviceProduct: ServiceProduct = {
  id: 'sp1',
  serviceId: 'svc-1',
  productId: 'p1',
  quantity: 2,
  product: {
    id: 'p1',
    code: 'COD-1',
    name: 'Aceite 20W50',
    consumptionType: 'partial',
  },
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

const catalogProduct = {
  id: 'p2',
  code: 'COD-2',
  name: 'Filtro de aire',
  consumptionType: 'direct',
};

const productsResponse = {
  data: [catalogProduct],
  meta: { page: 1, limit: 100, total: 1 },
};

type FetchOverrides = {
  serviceProductsResponse?: object;
  mutationResponse?: { ok: boolean; status: number; body: object };
};

function renderSection(options: { canManage?: boolean } & FetchOverrides = {}) {
  const {
    canManage = true,
    serviceProductsResponse = [serviceProduct],
    mutationResponse = { ok: true, status: 201, body: serviceProduct },
  } = options;

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const mutationCalls: { url: string; method: string; body?: unknown }[] = [];

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (init?.method && init.method !== 'GET') {
        mutationCalls.push({
          url,
          method: init.method,
          body: init.body ? JSON.parse(init.body as string) : undefined,
        });
        return {
          ok: mutationResponse.ok,
          status: mutationResponse.status,
          json: async () => mutationResponse.body,
        } as Response;
      }

      if (url.includes('/services/svc-1/products')) {
        return {
          ok: true,
          json: async () => serviceProductsResponse,
        } as Response;
      }

      if (url.includes('/products')) {
        return { ok: true, json: async () => productsResponse } as Response;
      }

      return { ok: false, status: 404, json: async () => ({}) } as Response;
    }
  );

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  }

  render(<ServiceProductsSection serviceId="svc-1" canManage={canManage} />, {
    wrapper: Wrapper,
  });

  return { mutationCalls };
}

describe('ServiceProductsSection', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('lists the recipe products with their quantities', async () => {
    renderSection();

    expect(await screen.findByText('COD-1 — Aceite 20W50')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad de Aceite 20W50')).toHaveValue(2);
  });

  it('shows the empty state when the recipe has no products', async () => {
    renderSection({ serviceProductsResponse: [] });

    expect(
      await screen.findByText('Este servicio no tiene productos asociados.')
    ).toBeInTheDocument();
  });

  it('is read-only when canManage is false', async () => {
    renderSection({ canManage: false });

    expect(await screen.findByText('COD-1 — Aceite 20W50')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Agregar producto' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Quitar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Cantidad de Aceite 20W50')
    ).not.toBeInTheDocument();
  });

  it('adds a product to the recipe', async () => {
    const { mutationCalls } = renderSection();
    const user = userEvent.setup();

    await screen.findByText('COD-1 — Aceite 20W50');
    await user.selectOptions(await screen.findByLabelText('Producto'), 'p2');
    await user.type(screen.getByLabelText('Cantidad'), '3');
    await user.click(screen.getByRole('button', { name: 'Agregar producto' }));

    await waitFor(() => expect(mutationCalls).toHaveLength(1));
    expect(mutationCalls[0]).toEqual({
      url: 'http://localhost:3000/api/services/svc-1/products',
      method: 'POST',
      body: { productId: 'p2', quantity: 3 },
    });
  });

  it('updates the quantity of a recipe product', async () => {
    const { mutationCalls } = renderSection();
    const user = userEvent.setup();

    const input = await screen.findByLabelText('Cantidad de Aceite 20W50');
    await user.clear(input);
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(mutationCalls).toHaveLength(1));
    expect(mutationCalls[0]).toEqual({
      url: 'http://localhost:3000/api/services/svc-1/products/p1',
      method: 'PATCH',
      body: { quantity: 5 },
    });
  });

  it('removes a product from the recipe', async () => {
    const { mutationCalls } = renderSection();
    const user = userEvent.setup();

    await screen.findByText('COD-1 — Aceite 20W50');
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    await waitFor(() => expect(mutationCalls).toHaveLength(1));
    expect(mutationCalls[0]).toEqual({
      url: 'http://localhost:3000/api/services/svc-1/products/p1',
      method: 'DELETE',
      body: undefined,
    });
  });

  it('maps the already-exists error when adding a duplicate', async () => {
    renderSection({
      mutationResponse: {
        ok: false,
        status: 409,
        body: {
          message: 'Already exists',
          errorCode: 'SERVICE_PRODUCT_ALREADY_EXISTS',
        },
      },
    });
    const user = userEvent.setup();

    await screen.findByText('COD-1 — Aceite 20W50');
    await user.selectOptions(await screen.findByLabelText('Producto'), 'p2');
    await user.type(screen.getByLabelText('Cantidad'), '3');
    await user.click(screen.getByRole('button', { name: 'Agregar producto' }));

    expect(
      await screen.findByText('El producto ya está en la receta.')
    ).toBeInTheDocument();
  });

  it('shows an error when the recipe request fails', async () => {
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

    render(<ServiceProductsSection serviceId="svc-1" canManage={false} />, {
      wrapper: Wrapper,
    });

    expect(
      await screen.findByText(
        'No se pudo cargar la receta. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });
});

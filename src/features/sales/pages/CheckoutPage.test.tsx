import { RouteGuard } from '@/features/shell/components/RouteGuard';
import {
  buildClient,
  buildProduct,
  buildService,
} from '@/features/work-orders/test/fixtures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSale } from '../test/fixtures';
import { CheckoutPage } from './CheckoutPage';

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

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

type PostResponse = {
  ok: boolean;
  status?: number;
  body?: unknown;
  hang?: boolean;
};

function mockFetch(postResponse: PostResponse) {
  const postCalls: Array<{ url: string; body: unknown }> = [];

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/users/me')) {
        return {
          ok: true,
          json: async () => adminUser,
        } as Response;
      }

      if (init?.method === 'POST') {
        postCalls.push({
          url,
          body: JSON.parse(String(init.body)),
        });
        if (postResponse.hang) {
          return new Promise<Response>(() => {});
        }
        return {
          ok: postResponse.ok,
          status: postResponse.status ?? 201,
          json: async () => postResponse.body,
        } as Response;
      }

      if (url.includes('/clients')) {
        return {
          ok: true,
          json: async () => ({
            data: [buildClient()],
            meta: { page: 1, limit: 100, total: 1 },
          }),
        } as Response;
      }
      if (url.includes('/services')) {
        return { ok: true, json: async () => [buildService()] } as Response;
      }
      return { ok: true, json: async () => [buildProduct()] } as Response;
    }
  );

  return postCalls;
}

function renderPage(initialPath = '/sales/new') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/sales/new" element={<CheckoutPage />} />
        <Route path="/sales/:id" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper }
  );
}

function renderGuardedPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={['/sales/new']}>
      <Routes>
        <Route
          path="/sales/new"
          element={
            <RouteGuard
              routePath="/sales/new"
              requiredRoles={['Admin', 'Reception']}
            >
              <CheckoutPage />
            </RouteGuard>
          }
        />
        <Route path="/unauthorized" element={<div>Acceso denegado</div>} />
        <Route path="/login" element={<div>Iniciar sesión</div>} />
      </Routes>
    </MemoryRouter>,
    {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    }
  );
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  const addButton = screen.getByRole('button', { name: 'Agregar producto' });
  await waitFor(() => expect(addButton).toBeEnabled());
  await user.selectOptions(screen.getByLabelText('Método de pago'), 'cash');
  await user.click(addButton);
  await screen.findByRole('option', { name: 'Filtro de aceite' });
  await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
  await user.clear(screen.getByLabelText('Cantidad'));
  await user.type(screen.getByLabelText('Cantidad'), '2');
  await user.click(screen.getByRole('button', { name: 'Registrar venta' }));
}

describe('CheckoutPage', () => {
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

  it('S13: submits a walk-in sale and navigates to the new sale detail', async () => {
    const postCalls = mockFetch({ ok: true, body: buildSale() });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].url).toBe('http://localhost:3000/api/sales');
    // Walk-in: clientId omitted; both line arrays always sent (D7).
    expect(postCalls[0].body).toEqual({
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 2 }],
      serviceLines: [],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/sales/sale1')
    );
  });

  it('S9: sends clientId when a client is selected', async () => {
    const postCalls = mockFetch({ ok: true, body: buildSale() });
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('option', { name: 'Juan Pérez' });
    await user.selectOptions(screen.getByLabelText('Cliente'), 'c1');
    await fillAndSubmit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].body).toMatchObject({ clientId: 'c1' });
  });

  it('S14: maps INSUFFICIENT_STOCK with details to a rich message naming the product', async () => {
    mockFetch({
      ok: false,
      status: 409,
      body: {
        message: 'Insufficient stock',
        errorCode: 'INSUFFICIENT_STOCK',
        details: [{ productId: 'p1', requested: 5, available: 2 }],
      },
    });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay stock suficiente de PRD-001 Filtro de aceite. Disponibles: 2, solicitadas: 5.'
    );
  });

  it('S15: maps SALE_EMPTY_LINES and PRODUCT_NOT_FOUND to Spanish messages', async () => {
    const first = mockFetch({
      ok: false,
      status: 400,
      body: { message: 'Empty lines', errorCode: 'SALE_EMPTY_LINES' },
    });
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Agregá al menos un producto o servicio.'
    );
    unmount();
    expect(first).toHaveLength(1);

    mockFetch({
      ok: false,
      status: 404,
      body: { message: 'Product not found', errorCode: 'PRODUCT_NOT_FOUND' },
    });
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Uno de los productos no existe o está inactivo.'
    );
  });

  it('S16: disables the submit button while pending and never double-fires', async () => {
    const postCalls = mockFetch({ ok: true, hang: true });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    const button = await screen.findByRole('button', {
      name: 'Registrando…',
    });
    expect(button).toBeDisabled();

    await user.click(button);

    await waitFor(() => expect(postCalls).toHaveLength(1));
  });

  it('redirects a Mechanic to /unauthorized', async () => {
    useUserMock.mockReturnValue({
      user: {
        id: 'u2',
        name: 'Pedro',
        email: 'pedro@example.com',
        role: { id: 'r2', name: 'Mechanic' },
      },
      isLoading: false,
      error: null,
    });
    mockFetch({ ok: true, body: buildSale() });

    renderGuardedPage();

    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Nueva venta' })
    ).not.toBeInTheDocument();
  });

  it('redirects a logged-out user to /login', async () => {
    useUserMock.mockReturnValue({ user: null, isLoading: false, error: null });
    mockFetch({ ok: true, body: buildSale() });

    renderGuardedPage();

    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Nueva venta' })
    ).not.toBeInTheDocument();
  });
});

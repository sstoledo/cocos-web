import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildClient,
  buildService,
  buildVehicle,
  buildWorkOrder,
} from '../test/fixtures';
import { WorkOrderFormPage } from './WorkOrderFormPage';

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderPage(initialPath = '/work-orders/new') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  // NOTE: each route gets its own page element. Reusing a single element
  // across routes (RTL wrapper-children pattern) breaks useParams context
  // under React 19 / React Router 7.
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/work-orders/new',
            element: createElement(WorkOrderFormPage),
          }),
          createElement(Route, {
            path: '/work-orders/:id/edit',
            element: createElement(WorkOrderFormPage),
          }),
          createElement(Route, {
            path: '/work-orders/:id',
            element: createElement(LocationDisplay),
          })
        )
      )
    )
  );
}

type PostResponse = {
  ok: boolean;
  status?: number;
  body?: unknown;
};

function mockFetch(postResponse: PostResponse) {
  const postCalls: Array<{ url: string; body: unknown }> = [];

  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (init?.method === 'POST') {
        postCalls.push({
          url,
          body: JSON.parse(String(init.body)),
        });
        return {
          ok: postResponse.ok,
          status: postResponse.status ?? 201,
          json: async () => postResponse.body,
        } as Response;
      }

      let body: unknown = [];
      if (url.includes('/clients')) {
        body = {
          data: [buildClient()],
          meta: { page: 1, limit: 100, total: 1 },
        };
      } else if (url.includes('/vehicles')) {
        body = {
          data: [buildVehicle()],
          meta: { page: 1, limit: 100, total: 1 },
        };
      } else if (url.includes('/services')) {
        body = [buildService()];
      }

      return { ok: true, json: async () => body } as Response;
    }
  );

  return postCalls;
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('option', { name: 'Juan Pérez' });
  await user.selectOptions(screen.getByLabelText('Cliente'), 'c1');
  await waitFor(() =>
    expect(screen.getByLabelText('Vehículo')).not.toBeDisabled()
  );
  await screen.findByRole('option', { name: /ABC123/ });
  await user.selectOptions(screen.getByLabelText('Vehículo'), 'v1');
  await user.click(screen.getByRole('button', { name: 'Agregar servicio' }));
  await user.selectOptions(screen.getByLabelText('Servicio'), 's1');
  await user.clear(screen.getByLabelText('Cantidad'));
  await user.type(screen.getByLabelText('Cantidad'), '2');
  await user.click(screen.getByRole('button', { name: 'Crear orden' }));
}

describe('WorkOrderFormPage (create)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('S1: creates a services-only order and navigates to the detail', async () => {
    const postCalls = mockFetch({ ok: true, body: buildWorkOrder() });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    await waitFor(() => expect(postCalls).toHaveLength(1));
    expect(postCalls[0].url).toBe('http://localhost:3000/api/work-orders');
    expect(postCalls[0].body).toEqual({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 2, unitPrice: 150 }],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/work-orders/wo1'
      )
    );
  });

  it('S8: maps backend errorCodes to Spanish alert messages', async () => {
    mockFetch({
      ok: false,
      status: 409,
      body: { message: 'Conflict', errorCode: 'VEHICLE_CLIENT_MISMATCH' },
    });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El vehículo no pertenece al cliente seleccionado.'
    );
  });

  it('S8: falls back to a generic message on unknown errors', async () => {
    mockFetch({ ok: false, status: 500, body: {} });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo guardar la orden. Intentá de nuevo más tarde.'
    );
  });
});

describe('WorkOrderFormPage (edit)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function mockEditFetch(patchResponse: PostResponse) {
    const patchCalls: Array<{ url: string; body: unknown }> = [];

    globalThis.fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (init?.method === 'PATCH') {
          patchCalls.push({
            url,
            body: JSON.parse(String(init.body)),
          });
          return {
            ok: patchResponse.ok,
            status: patchResponse.status ?? 200,
            json: async () => patchResponse.body,
          } as Response;
        }

        let body: unknown = [];
        if (url.includes('/work-orders/')) {
          body = buildWorkOrder();
        } else if (url.includes('/clients')) {
          body = {
            data: [buildClient()],
            meta: { page: 1, limit: 100, total: 1 },
          };
        } else if (url.includes('/vehicles')) {
          body = {
            data: [buildVehicle()],
            meta: { page: 1, limit: 100, total: 1 },
          };
        } else if (url.includes('/services')) {
          body = [buildService()];
        }

        return { ok: true, json: async () => body } as Response;
      }
    );

    return patchCalls;
  }

  it('S6: pre-fills the form from the loaded order', async () => {
    mockEditFetch({ ok: true, body: buildWorkOrder() });
    renderPage('/work-orders/wo1/edit');

    expect(await screen.findByLabelText('Cliente')).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Juan Pérez' });
    expect(screen.getByLabelText('Cliente')).toHaveValue('c1');
    await screen.findByRole('option', { name: /ABC123/ });
    expect(screen.getByLabelText('Vehículo')).toHaveValue('v1');
    await screen.findByRole('option', { name: 'Cambio de aceite' });
    expect(screen.getByLabelText('Servicio')).toHaveValue('s1');
    expect(screen.getByLabelText('Cantidad')).toHaveValue(2);
    expect(screen.getByLabelText('Precio unitario')).toHaveValue(150);
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('S6: submits PATCH with both line arrays and navigates to the detail', async () => {
    const patchCalls = mockEditFetch({ ok: true, body: buildWorkOrder() });
    const user = userEvent.setup();
    renderPage('/work-orders/wo1/edit');

    expect(await screen.findByLabelText('Cliente')).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Juan Pérez' });
    expect(screen.getByLabelText('Cliente')).toHaveValue('c1');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '3');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(patchCalls).toHaveLength(1));
    expect(patchCalls[0].url).toBe('http://localhost:3000/api/work-orders/wo1');
    expect(patchCalls[0].body).toEqual({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 3, unitPrice: 150 }],
    });

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/work-orders/wo1'
      )
    );
  });

  it('S9: shows a loading state while the order is being fetched', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    renderPage('/work-orders/wo1/edit');

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });
});

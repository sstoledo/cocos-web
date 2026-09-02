import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildClient,
  buildProduct,
  buildService,
  buildVehicle,
} from '../test/fixtures';
import { WorkOrderForm } from './WorkOrderForm';

const clients = [buildClient(), buildClient({ id: 'c2', name: 'María López' })];
const services = [buildService()];
const products = [buildProduct()];

function mockCatalogs() {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    let body: unknown = [];
    if (url.includes('/clients')) {
      body = { data: clients, meta: { page: 1, limit: 100, total: 2 } };
    } else if (url.includes('/vehicles')) {
      body = {
        data: url.includes('clientId=c2')
          ? [buildVehicle({ id: 'v2', plate: 'XYZ789', clientId: 'c2' })]
          : [buildVehicle()],
        meta: { page: 1, limit: 100, total: 1 },
      };
    } else if (url.includes('/services')) {
      body = services;
    } else if (url.includes('/products')) {
      body = products;
    }

    return { ok: true, json: async () => body } as Response;
  });
}

function renderForm(props: Partial<Parameters<typeof WorkOrderForm>[0]> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onSubmit = props.onSubmit ?? vi.fn();
  const user = userEvent.setup();

  render(
    createElement(
      MemoryRouter,
      null,
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(WorkOrderForm, { onSubmit, ...props })
      )
    )
  );

  return { user, onSubmit };
}

async function selectClientAndVehicle(
  user: ReturnType<typeof userEvent.setup>
) {
  await screen.findByRole('option', { name: 'Juan Pérez' });
  await user.selectOptions(screen.getByLabelText('Cliente'), 'c1');
  await waitFor(() =>
    expect(screen.getByLabelText('Vehículo')).not.toBeDisabled()
  );
  await screen.findByRole('option', { name: /ABC123/ });
  await user.selectOptions(screen.getByLabelText('Vehículo'), 'v1');
}

describe('WorkOrderForm', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    mockCatalogs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('S5: requires client, vehicle and at least one line', async () => {
    const { user, onSubmit } = renderForm();

    await screen.findByRole('option', { name: 'Juan Pérez' });
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    expect(
      await screen.findByText('Seleccioná un cliente')
    ).toBeInTheDocument();
    expect(screen.getByText('Seleccioná un vehículo')).toBeInTheDocument();
    expect(screen.getByRole('alert').textContent).toContain(
      'Agregá al menos un servicio o producto'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('S3: auto-fills the price snapshot and allows overriding it', async () => {
    const { user, onSubmit } = renderForm();

    await selectClientAndVehicle(user);
    await user.click(screen.getByRole('button', { name: 'Agregar servicio' }));
    await user.selectOptions(screen.getByLabelText('Servicio'), 's1');

    const priceInput = screen.getByLabelText('Precio unitario');
    await waitFor(() => expect(priceInput).toHaveValue(150));

    await user.clear(priceInput);
    await user.type(priceInput, '90.25');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '2');
    await user.click(screen.getByRole('button', { name: 'Crear orden' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'c1',
        vehicleId: 'v1',
        services: [{ serviceId: 's1', quantity: 2, unitPrice: 90.25 }],
        products: [],
      }),
      expect.anything()
    );
  });

  it('S4: vehicle selector is disabled until a client is chosen and resets on change', async () => {
    const { user } = renderForm();

    await screen.findByRole('option', { name: 'Juan Pérez' });
    expect(screen.getByLabelText('Vehículo')).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Cliente'), 'c1');
    await waitFor(() =>
      expect(screen.getByLabelText('Vehículo')).not.toBeDisabled()
    );
    await user.selectOptions(screen.getByLabelText('Vehículo'), 'v1');
    expect(screen.getByLabelText('Vehículo')).toHaveValue('v1');

    await user.selectOptions(screen.getByLabelText('Cliente'), 'c2');
    expect(screen.getByLabelText('Vehículo')).toHaveValue('');
    await waitFor(() =>
      expect(screen.getByLabelText('Vehículo')).toContainElement(
        screen.getByRole('option', { name: /XYZ789/ })
      )
    );
  });

  it('S10: live total uses integer-cents arithmetic without float drift', async () => {
    const { user } = renderForm();

    await screen.findByRole('option', { name: 'Juan Pérez' });

    await user.click(screen.getByRole('button', { name: 'Agregar servicio' }));
    await user.selectOptions(screen.getByLabelText('Servicio'), 's1');
    const priceInput = screen.getByLabelText('Precio unitario');
    await user.clear(priceInput);
    await user.type(priceInput, '0.10');
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '3');

    await user.click(screen.getByRole('button', { name: 'Agregar producto' }));
    await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
    const productPrice = screen.getByLabelText('Precio unitario', {
      selector: '#products-0-unitPrice',
    });
    await waitFor(() => expect(productPrice).toHaveValue(80.5));
    await user.clear(productPrice);
    await user.type(productPrice, '19.99');

    await waitFor(() =>
      expect(screen.getByText('Total: 20.29')).toBeInTheDocument()
    );
  });

  it('S9: disables the submit button while pending', async () => {
    renderForm({ isPending: true });

    await waitFor(() =>
      expect(screen.getByLabelText('Cliente')).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled();
  });
});

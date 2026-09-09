import {
  buildClient,
  buildProduct,
  buildService,
} from '@/features/work-orders/test/fixtures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutForm } from './CheckoutForm';

function renderForm(onSubmit = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      null,
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  }

  return {
    onSubmit,
    ...render(<CheckoutForm onSubmit={onSubmit} />, { wrapper: Wrapper }),
  };
}

function mockCatalogFetch() {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.includes('/clients')) {
      return {
        ok: true,
        json: async () => ({
          data: [buildClient()],
          meta: { page: 1, limit: 100, total: 1 },
        }),
      };
    }
    if (url.includes('/services')) {
      return { ok: true, json: async () => [buildService()] };
    }
    return { ok: true, json: async () => [buildProduct()] };
  });
}

async function addProductLine(
  user: ReturnType<typeof userEvent.setup>,
  quantity = '1'
) {
  const addButton = screen.getByRole('button', { name: 'Agregar producto' });
  await waitFor(() => expect(addButton).toBeEnabled());
  await user.click(addButton);
  await screen.findByRole('option', { name: 'Filtro de aceite' });
  await user.selectOptions(screen.getByLabelText('Producto'), 'p1');
  if (quantity !== '1') {
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), quantity);
  }
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    mockCatalogFetch();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('S10: adds a product line with read-only catalog price and live subtotal/total', async () => {
    const user = userEvent.setup();
    renderForm();

    await addProductLine(user, '2');

    // Catalog price renders read-only; money stays in plain decimal strings.
    expect(screen.getByText('Precio: 80.50')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: 161.00')).toBeInTheDocument();
    expect(screen.getByText('Total: 161.00')).toBeInTheDocument();
    expect(screen.queryByLabelText('Precio unitario')).not.toBeInTheDocument();
  });

  it('S10: adds a service line and sums product + service totals', async () => {
    const user = userEvent.setup();
    renderForm();

    await addProductLine(user, '1');
    const serviceAddButton = screen.getByRole('button', {
      name: 'Agregar servicio',
    });
    await waitFor(() => expect(serviceAddButton).toBeEnabled());
    await user.click(serviceAddButton);
    await screen.findByRole('option', { name: 'Cambio de aceite' });
    await user.selectOptions(screen.getByLabelText('Servicio'), 's1');
    // Service lines render above product lines in the DOM.
    await user.clear(screen.getAllByLabelText('Cantidad')[0]);
    await user.type(screen.getAllByLabelText('Cantidad')[0], '2');

    expect(screen.getByText('Precio: 150.00')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: 300.00')).toBeInTheDocument();
    expect(screen.getByText('Total: 380.50')).toBeInTheDocument();
  });

  it('S11: removes a line and updates the totals', async () => {
    const user = userEvent.setup();
    renderForm();

    await addProductLine(user, '2');
    expect(screen.getByText('Total: 161.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(screen.queryByText('Precio: 80.50')).not.toBeInTheDocument();
    expect(screen.getByText('Total: 0.00')).toBeInTheDocument();
  });

  it('S12: blocks submit and shows the no-lines error when the sale is empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const addButton = screen.getByRole('button', { name: 'Agregar producto' });
    await waitFor(() => expect(addButton).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Método de pago'), 'cash');
    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Agregá al menos un producto o servicio'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('S12: blocks submit with "Mínimo 1" when the quantity is below 1', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await addProductLine(user);
    await user.clear(screen.getByLabelText('Cantidad'));
    await user.type(screen.getByLabelText('Cantidad'), '0');
    await user.selectOptions(screen.getByLabelText('Método de pago'), 'cash');
    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mínimo 1');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('S12: requires a payment method before submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await addProductLine(user, '1');
    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(
      screen.getByText('Seleccioná un método de pago')
    ).toBeInTheDocument();
  });

  it('submits valid values to the parent', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await addProductLine(user, '2');
    await user.selectOptions(screen.getByLabelText('Método de pago'), 'card');
    await user.click(screen.getByRole('button', { name: 'Registrar venta' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const values = onSubmit.mock.calls[0][0];
    expect(values).toMatchObject({
      clientId: '',
      paymentMethod: 'card',
      productLines: [{ productId: 'p1', quantity: 2 }],
      serviceLines: [],
    });
  });
});

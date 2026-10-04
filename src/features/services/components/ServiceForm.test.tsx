import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceFormValues } from '../types';
import { ServiceForm } from './ServiceForm';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

type ReactNode = React.ReactNode;

const validValues: ServiceFormValues = {
  code: 'SRV-001',
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: 150,
  estimatedDuration: 30,
  isActive: true,
};

describe('ServiceForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderForm(initialValues?: ServiceFormValues) {
    return render(
      <MemoryRouter>
        <ServiceForm onSubmit={onSubmit} initialValues={initialValues} />
      </MemoryRouter>,
      { wrapper: createWrapper() }
    );
  }

  it('renders all fields', () => {
    renderForm();

    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Duración estimada (minutos)')
    ).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(screen.getByText('El código es requerido')).toBeInTheDocument();
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
  });

  it('shows validation error for price <= 0', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'SRV-001' },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: '0' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(
        screen.getByText('El precio debe ser mayor a 0')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for code max length', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'a'.repeat(51) },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: '100' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(
        screen.getByText('El código no puede superar 50 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for name max length', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'SRV-001' },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'a'.repeat(201) },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: '100' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(
        screen.getByText('El nombre no puede superar 200 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for non-integer estimatedDuration', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'SRV-001' },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Duración estimada (minutos)'), {
      target: { value: '30.5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(
        screen.getByText('La duración estimada debe ser un número entero')
      ).toBeInTheDocument();
    });
  });

  it('submits valid form', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: validValues.code },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: validValues.name },
    });
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: validValues.description },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: validValues.price.toString() },
    });
    fireEvent.change(screen.getByLabelText('Duración estimada (minutos)'), {
      target: { value: validValues.estimatedDuration?.toString() ?? '' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear servicio/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining(validValues)
      );
    });
  });

  it('prefills form with initialValues in edit mode', () => {
    renderForm(validValues);

    expect(screen.getByLabelText('Código')).toHaveValue(validValues.code);
    expect(screen.getByLabelText('Nombre')).toHaveValue(validValues.name);
    expect(screen.getByLabelText('Descripción')).toHaveValue(
      validValues.description
    );
    // Input type="number" returns number value in react-hook-form
    expect(screen.getByLabelText('Precio')).toHaveValue(validValues.price);
    expect(screen.getByLabelText('Duración estimada (minutos)')).toHaveValue(
      validValues.estimatedDuration ?? 0
    );
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeChecked();
  });

  it('shows loading state when isPending prop is true', () => {
    const { rerender } = renderForm();

    // Fill form to make submit button enabled
    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: validValues.code },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: validValues.name },
    });
    fireEvent.change(screen.getByLabelText('Precio'), {
      target: { value: String(validValues.price) },
    });

    // Re-render with isPending=true
    rerender(
      <MemoryRouter>
        <ServiceForm onSubmit={onSubmit} isPending={true} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /creando…/i })).toBeDisabled();
  });
});

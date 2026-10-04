import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupplierFormPage } from '../pages/SupplierFormPage';

const mockSupplier = {
  id: 's1',
  name: 'Proveedor 1',
  phone: '999111222',
  email: 'p1@example.com',
  address: 'Calle 1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

vi.mock('../hooks/use-supplier', () => ({
  useSupplier: vi.fn(),
}));

vi.mock('../hooks/use-create-supplier', () => ({
  useCreateSupplier: vi.fn(),
}));

vi.mock('../hooks/use-update-supplier', () => ({
  useUpdateSupplier: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

import { useNavigate, useParams } from 'react-router';
import { useCreateSupplier } from '../hooks/use-create-supplier';
import { useSupplier } from '../hooks/use-supplier';
import { useUpdateSupplier } from '../hooks/use-update-supplier';

function renderPage(
  path: string,
  overrides: {
    supplier?: typeof mockSupplier | undefined;
    isLoadingSupplier?: boolean;
    supplierError?: Error | null;
    createMutation?: {
      mutate: ReturnType<typeof vi.fn>;
      isPending: boolean;
      error: Error | null;
    };
    updateMutation?: {
      mutate: ReturnType<typeof vi.fn>;
      isPending: boolean;
      error: Error | null;
    };
    params?: { id?: string };
  } = {}
) {
  const {
    supplier,
    isLoadingSupplier = false,
    supplierError = null,
    createMutation = { mutate: vi.fn(), isPending: false, error: null },
    updateMutation = { mutate: vi.fn(), isPending: false, error: null },
    params = {},
  } = overrides;

  (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue(params);
  (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());

  (useSupplier as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: supplier,
    isLoading: isLoadingSupplier,
    error: supplierError,
  });

  (useCreateSupplier as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    createMutation
  );
  (useUpdateSupplier as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    updateMutation
  );

  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <SupplierFormPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SupplierFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders "Nuevo proveedor" title in create mode', () => {
    renderPage('/suppliers/new', { params: {} });

    expect(screen.getByText('Nuevo proveedor')).toBeInTheDocument();
  });

  it('renders "Editar proveedor" title in edit mode', () => {
    renderPage('/suppliers/s1/edit', {
      supplier: mockSupplier,
      params: { id: 's1' },
    });

    expect(screen.getByText('Editar proveedor')).toBeInTheDocument();
  });

  it('prefills form in edit mode', () => {
    renderPage('/suppliers/s1/edit', {
      supplier: mockSupplier,
      params: { id: 's1' },
    });

    expect(screen.getByLabelText('Nombre')).toHaveValue('Proveedor 1');
    expect(screen.getByLabelText('Teléfono')).toHaveValue('999111222');
    expect(screen.getByLabelText('Email')).toHaveValue('p1@example.com');
    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle 1');
  });

  it('shows loading state while fetching supplier in edit mode', () => {
    renderPage('/suppliers/s1/edit', {
      isLoadingSupplier: true,
      params: { id: 's1' },
    });

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows error when supplier fetch fails in edit mode', () => {
    renderPage('/suppliers/s1/edit', {
      supplierError: new Error('Failed'),
      params: { id: 's1' },
    });

    expect(
      screen.getByText(
        'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });

  it('shows create mutation error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed');
    const createMutation = {
      mutate: vi.fn((_values, options) => {
        options?.onError?.(error);
      }),
      isPending: false,
      error,
    };

    renderPage('/suppliers/new', { createMutation, params: {} });

    await user.type(screen.getByLabelText('Nombre'), 'Proveedor');
    await user.click(screen.getByRole('button', { name: 'Crear proveedor' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo crear el proveedor. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });

  it('shows update mutation error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed');
    const updateMutation = {
      mutate: vi.fn((_values, options) => {
        options?.onError?.(error);
      }),
      isPending: false,
      error,
    };

    renderPage('/suppliers/s1/edit', {
      supplier: mockSupplier,
      updateMutation,
      params: { id: 's1' },
    });

    await user.type(screen.getByLabelText('Nombre'), 'Proveedor Actualizado');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo actualizar el proveedor. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });
});

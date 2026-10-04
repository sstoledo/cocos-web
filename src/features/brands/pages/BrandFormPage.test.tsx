import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandFormPage } from './BrandFormPage';

const mockBrand = {
  id: 'b1',
  name: 'Marca Existente',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

vi.mock('../hooks/use-brand', () => ({
  useBrand: vi.fn(),
}));

vi.mock('../hooks/use-create-brand', () => ({
  useCreateBrand: vi.fn(),
}));

vi.mock('../hooks/use-update-brand', () => ({
  useUpdateBrand: vi.fn(),
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
import { useBrand } from '../hooks/use-brand';
import { useCreateBrand } from '../hooks/use-create-brand';
import { useUpdateBrand } from '../hooks/use-update-brand';

function renderPage(
  path: string,
  overrides: {
    brand?: typeof mockBrand | undefined;
    isLoadingBrand?: boolean;
    brandError?: Error | null;
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
    brand,
    isLoadingBrand = false,
    brandError = null,
    createMutation = { mutate: vi.fn(), isPending: false, error: null },
    updateMutation = { mutate: vi.fn(), isPending: false, error: null },
    params = {},
  } = overrides;

  (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue(params);
  (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());

  (useBrand as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: brand,
    isLoading: isLoadingBrand,
    error: brandError,
  });

  (useCreateBrand as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    createMutation
  );
  (useUpdateBrand as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    updateMutation
  );

  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <BrandFormPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('BrandFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders "Nueva marca" title in create mode', () => {
    renderPage('/brands/new', { params: {} });

    expect(screen.getByText('Nueva marca')).toBeInTheDocument();
  });

  it('renders "Editar marca" title in edit mode', () => {
    renderPage('/brands/b1/edit', {
      brand: mockBrand,
      params: { id: 'b1' },
    });

    expect(screen.getByText('Editar marca')).toBeInTheDocument();
  });

  it('prefills form in edit mode', () => {
    renderPage('/brands/b1/edit', {
      brand: mockBrand,
      params: { id: 'b1' },
    });

    expect(screen.getByLabelText('Nombre')).toHaveValue('Marca Existente');
  });

  it('shows loading state while fetching brand in edit mode', () => {
    renderPage('/brands/b1/edit', {
      isLoadingBrand: true,
      params: { id: 'b1' },
    });

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows error when brand fetch fails in edit mode', () => {
    renderPage('/brands/b1/edit', {
      brandError: new Error('Failed'),
      params: { id: 'b1' },
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

    renderPage('/brands/new', { createMutation, params: {} });

    await user.type(screen.getByLabelText('Nombre'), 'Marca');
    await user.click(screen.getByRole('button', { name: 'Crear marca' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo crear la marca. Intentá de nuevo más tarde.'
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

    renderPage('/brands/b1/edit', {
      brand: mockBrand,
      updateMutation,
      params: { id: 'b1' },
    });

    await user.type(screen.getByLabelText('Nombre'), 'Marca Actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo actualizar la marca. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });
});

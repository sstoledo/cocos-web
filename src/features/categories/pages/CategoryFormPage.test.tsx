import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryFormPage } from './CategoryFormPage';

const mockCategory = {
  id: 'c1',
  name: 'Categoría Existente',
  parentId: null,
  parent: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockAllCategories = [
  {
    id: 'c1',
    name: 'Categoría Existente',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Otra Categoría',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
];

vi.mock('../hooks/use-category', () => ({
  useCategory: vi.fn(),
}));

vi.mock('../api/get-categories', () => ({
  getCategories: vi.fn(),
}));

vi.mock('../hooks/use-create-category', () => ({
  useCreateCategory: vi.fn(),
}));

vi.mock('../hooks/use-update-category', () => ({
  useUpdateCategory: vi.fn(),
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
import { getCategories } from '../api/get-categories';
import { useCategory } from '../hooks/use-category';
import { useCreateCategory } from '../hooks/use-create-category';
import { useUpdateCategory } from '../hooks/use-update-category';

function renderPage(
  path: string,
  overrides: {
    category?: typeof mockCategory | undefined;
    allCategories?: typeof mockAllCategories;
    isLoadingCategory?: boolean;
    isLoadingCategories?: boolean;
    categoryError?: Error | null;
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
    category,
    allCategories = mockAllCategories,
    isLoadingCategory = false,
    categoryError = null,
    createMutation = { mutate: vi.fn(), isPending: false, error: null },
    updateMutation = { mutate: vi.fn(), isPending: false, error: null },
    params = {},
  } = overrides;

  (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue(params);
  (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());

  (getCategories as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    allCategories
  );
  (useCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: category,
    isLoading: isLoadingCategory,
    error: categoryError,
  });

  (useCreateCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    createMutation
  );
  (useUpdateCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    updateMutation
  );

  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={new QueryClient()}>
        <CategoryFormPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CategoryFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders "Nueva categoría" title in create mode', () => {
    renderPage('/categories/new', { params: {} });

    expect(screen.getByText('Nueva categoría')).toBeInTheDocument();
  });

  it('renders "Editar categoría" title in edit mode', () => {
    renderPage('/categories/c1/edit', {
      category: mockCategory,
      params: { id: 'c1' },
    });

    expect(screen.getByText('Editar categoría')).toBeInTheDocument();
  });

  it('prefills form in edit mode', async () => {
    renderPage('/categories/c1/edit', {
      category: mockCategory,
      params: { id: 'c1' },
    });

    await waitFor(() =>
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('Nombre')).toHaveValue('Categoría Existente');
  });

  it('shows loading state while fetching category in edit mode', () => {
    renderPage('/categories/c1/edit', {
      isLoadingCategory: true,
      params: { id: 'c1' },
    });

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows error when category fetch fails in edit mode', async () => {
    renderPage('/categories/c1/edit', {
      categoryError: new Error('Failed'),
      params: { id: 'c1' },
    });

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
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

    renderPage('/categories/new', { createMutation, params: {} });

    await waitFor(() =>
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Nombre'), 'Categoría');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo crear la categoría. Intentá de nuevo más tarde.'
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

    renderPage('/categories/c1/edit', {
      category: mockCategory,
      updateMutation,
      params: { id: 'c1' },
    });

    await waitFor(() =>
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Nombre'), 'Categoría Actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'No se pudo actualizar la categoría. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument()
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductFormPage } from './ProductFormPage';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/products/new'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/products/new',
            element: children,
          }),
          createElement(Route, {
            path: '/products',
            element: createElement(LocationDisplay),
          })
        )
      )
    );
  };
}

function createEditWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/products/prod-1/edit'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/products/:id/edit',
            element: children,
          }),
          createElement(Route, {
            path: '/products',
            element: createElement(LocationDisplay),
          })
        )
      )
    );
  };
}

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

const references = {
  presentations: [{ id: 'p1', name: 'Litro' }],
  brands: [{ id: 'b1', name: 'Castrol' }],
  categories: [{ id: 'c1', name: 'Lubricantes' }],
};

const updatedProduct = {
  id: 'prod-1',
  code: 'COD-001',
  name: 'Aceite 20W50 actualizado',
  price: '30.00',
  isActive: true,
  presentation: { id: 'p1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const createdProduct = {
  id: 'prod-1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  isActive: true,
  presentation: { id: 'p1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const existingProduct = {
  id: 'prod-1',
  code: 'COD-001',
  name: 'Aceite 20W50',
  price: '25.00',
  description: 'Descripción',
  isActive: true,
  presentation: { id: 'p1', name: 'Litro' },
  brand: { id: 'b1', name: 'Castrol' },
  category: { id: 'c1', name: 'Lubricantes' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the page title and loading state', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ProductFormPage />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole('heading', { name: 'Nuevo producto' })
    ).toBeInTheDocument();
    expect(screen.getByText('Cargando catálogos…')).toBeInTheDocument();
  });

  it('shows an error when references fail to load', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<ProductFormPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los catálogos'
      )
    );
  });

  it('submits the form and navigates to the product list', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.presentations,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.brands,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.categories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createdProduct,
      });

    render(<ProductFormPage />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Código')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Código'), 'COD-001');
    await user.type(screen.getByLabelText('Nombre'), 'Aceite 20W50');
    await user.type(screen.getByLabelText('Precio'), '25');
    await user.selectOptions(screen.getByLabelText('Presentación'), 'p1');
    await user.selectOptions(screen.getByLabelText('Marca'), 'b1');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'c1');

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/products',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
    );

    const requestInit = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[3][1] as RequestInit;
    const formData = requestInit.body as FormData;
    expect(formData.get('code')).toBe('COD-001');
    expect(formData.get('name')).toBe('Aceite 20W50');
    expect(formData.get('price')).toBe('25');

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/products')
    );
  });

  it('renders the edit page title and prefills the form', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.presentations,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.brands,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.categories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => existingProduct,
      });

    render(<ProductFormPage />, {
      wrapper: createEditWrapper(),
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Editar producto' })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Código')).toHaveValue('COD-001')
    );

    expect(screen.getByLabelText('Nombre')).toHaveValue('Aceite 20W50');
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' })
    ).toBeInTheDocument();
  });

  it('updates the product and navigates to the product list', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.presentations,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.brands,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => references.categories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => existingProduct,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedProduct,
      });

    render(<ProductFormPage />, {
      wrapper: createEditWrapper(),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Código')).toBeInTheDocument()
    );

    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(
      screen.getByLabelText('Nombre'),
      'Aceite 20W50 actualizado'
    );
    await user.clear(screen.getByLabelText('Precio'));
    await user.type(screen.getByLabelText('Precio'), '30');

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products/prod-1',
        expect.objectContaining({
          method: 'PATCH',
          credentials: 'include',
        })
      )
    );

    const patchCall = (
      globalThis.fetch as ReturnType<typeof vi.fn>
    ).mock.calls.find(
      (call) =>
        call[0] === 'http://localhost:3000/api/products/prod-1' &&
        (call[1] as RequestInit).method === 'PATCH'
    );
    const requestInit = patchCall?.[1] as RequestInit;
    const formData = requestInit.body as FormData;
    expect(formData.get('name')).toBe('Aceite 20W50 actualizado');
    expect(formData.get('price')).toBe('30');

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/products')
    );
  });
});

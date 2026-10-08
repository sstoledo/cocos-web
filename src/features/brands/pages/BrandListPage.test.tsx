import * as useUserModule from '@/features/shell/hooks/useUser';
import type { User } from '@/features/shell/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandListPage } from './BrandListPage';

const mockBrands = [
  { id: 'b1', name: 'Marca 1', createdAt: '', updatedAt: '' },
  { id: 'b2', name: 'Marca 2', createdAt: '', updatedAt: '' },
];

function createWrapper(initialEntries: string[] = ['/brands']) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

const wrapper = createWrapper();

describe('BrandListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    vi.spyOn(useUserModule, 'useUser').mockReturnValue({
      user: {
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        role: { id: '1', name: 'Admin' },
      } as User,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('renders page title', () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });
    render(<BrandListPage />, { wrapper });
    expect(screen.getByText('Marcas')).toBeInTheDocument();
  });

  it('shows new brand button for Admin', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });
    render(<BrandListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByText('Nueva marca')).toBeInTheDocument()
    );
  });

  it('hides new brand button for non-Admin', async () => {
    vi.spyOn(useUserModule, 'useUser').mockReturnValue({
      user: {
        id: '2',
        name: 'Reception',
        email: 'reception@test.com',
        role: { id: '2', name: 'Reception' },
      } as User,
      isLoading: false,
      error: null,
    });
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });
    render(<BrandListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.queryByText('Nueva marca')).not.toBeInTheDocument()
    );
  });

  it('filters brands when search input changes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands,
    });
    const user = userEvent.setup();
    render(<BrandListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Marca 1');
    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/brands?q=Marca+1&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('deletes a brand after confirming in the dialog', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 1, limit: 10, total: 2 },
      }),
    });

    render(<BrandListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Marca 1')).toBeInTheDocument()
    );

    await user.click(screen.getByLabelText('Eliminar Marca 1'));

    expect(screen.getByText('Eliminar marca')).toBeInTheDocument();
    expect(
      screen.getByText(
        '¿Eliminar la marca "Marca 1"? Esta acción no se puede deshacer.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/brands/b1',
        { method: 'DELETE', credentials: 'include' }
      )
    );
  });

  it('does not delete a brand when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 1, limit: 10, total: 2 },
      }),
    });

    render(<BrandListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Marca 1')).toBeInTheDocument()
    );

    await user.click(screen.getByLabelText('Eliminar Marca 1'));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(screen.queryByText('Eliminar marca')).not.toBeInTheDocument()
    );
    expect(globalThis.fetch).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/brands/b1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('renders pagination when there is more than one page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 1, limit: 10, total: 25 },
      }),
    });

    render(<BrandListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );
  });

  it('hides pagination when the results fit one page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 1, limit: 10, total: 10 },
      }),
    });

    render(<BrandListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Marca 1')).toBeInTheDocument()
    );
    expect(screen.queryByText(/Página 1 de/)).not.toBeInTheDocument();
  });

  it('requests the next page when the next button is clicked', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 1, limit: 10, total: 25 },
      }),
    });

    render(<BrandListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/brands?page=2&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('resets the page to 1 when the search filter changes', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBrands,
        meta: { page: 3, limit: 10, total: 25 },
      }),
    });

    render(<BrandListPage />, { wrapper: createWrapper(['/brands?page=3']) });

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/brands?page=3&limit=10',
        { credentials: 'include' }
      )
    );

    await user.type(screen.getByLabelText('Buscar por nombre'), 'Marca');

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/brands?q=Marca&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });
});

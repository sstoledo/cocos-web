import * as useUserModule from '@/features/shell/hooks/useUser';
import type { User } from '@/features/shell/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryListPage } from './CategoryListPage';

const mockCategories = [
  {
    id: 'c1',
    name: 'Categoría 1',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Categoría 2',
    parentId: null,
    parent: null,
    createdAt: '',
    updatedAt: '',
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/categories']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CategoryListPage', () => {
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
      json: async () => mockCategories,
    });
    render(<CategoryListPage />, { wrapper });
    expect(screen.getByText('Categorías')).toBeInTheDocument();
  });

  it('shows new category button for Admin', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });
    render(<CategoryListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByText('Nueva categoría')).toBeInTheDocument()
    );
  });

  it('hides new category button for non-Admin', async () => {
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
      json: async () => mockCategories,
    });
    render(<CategoryListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.queryByText('Nueva categoría')).not.toBeInTheDocument()
    );
  });

  it('filters categories when search input changes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });
    const user = userEvent.setup();
    render(<CategoryListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument()
    );
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Categoría 1');
    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/categories?q=Categor%C3%ADa+1',
        { credentials: 'include' }
      )
    );
  });
});

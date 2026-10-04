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

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/brands']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

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
        'http://localhost:3000/api/brands?q=Marca+1',
        { credentials: 'include' }
      )
    );
  });
});

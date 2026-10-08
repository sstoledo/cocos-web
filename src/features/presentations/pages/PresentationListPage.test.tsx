import * as useUserModule from '@/features/shell/hooks/useUser';
import type { User } from '@/features/shell/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PresentationListPage } from './PresentationListPage';

const mockPresentations = [
  { id: 'p1', name: 'Presentación 1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Presentación 2', createdAt: '', updatedAt: '' },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/presentations']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PresentationListPage', () => {
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
      json: async () => mockPresentations,
    });
    render(<PresentationListPage />, { wrapper });
    expect(screen.getByText('Presentaciones')).toBeInTheDocument();
  });

  it('deletes a presentation after confirming in the dialog', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockPresentations,
        meta: { page: 1, limit: 10, total: 2 },
      }),
    });

    render(<PresentationListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Presentación 1')).toBeInTheDocument()
    );

    await user.click(screen.getByLabelText('Eliminar Presentación 1'));

    expect(screen.getByText('Eliminar presentación')).toBeInTheDocument();
    expect(
      screen.getByText(
        '¿Eliminar la presentación "Presentación 1"? Esta acción no se puede deshacer.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/presentations/p1',
        { method: 'DELETE', credentials: 'include' }
      )
    );
  });

  it('does not delete a presentation when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockPresentations,
        meta: { page: 1, limit: 10, total: 2 },
      }),
    });

    render(<PresentationListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Presentación 1')).toBeInTheDocument()
    );

    await user.click(screen.getByLabelText('Eliminar Presentación 1'));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Eliminar presentación')
      ).not.toBeInTheDocument()
    );
    expect(globalThis.fetch).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/presentations/p1',
      { method: 'DELETE', credentials: 'include' }
    );
  });

  it('shows new presentation button for Admin', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });
    render(<PresentationListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByText('Nueva presentación')).toBeInTheDocument()
    );
  });

  it('hides new presentation button for non-Admin', async () => {
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
      json: async () => mockPresentations,
    });
    render(<PresentationListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.queryByText('Nueva presentación')).not.toBeInTheDocument()
    );
  });

  it('filters presentations when search input changes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });
    const user = userEvent.setup();
    render(<PresentationListPage />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument()
    );
    await user.type(
      screen.getByLabelText('Buscar por nombre'),
      'Presentación 1'
    );
    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/presentations?q=Presentaci%C3%B3n+1&page=1&limit=10',
        { credentials: 'include' }
      )
    );
  });

  it('renders pagination when there is more than one page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockPresentations,
        meta: { page: 1, limit: 10, total: 30 },
      }),
    });

    render(<PresentationListPage />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );
  });
});

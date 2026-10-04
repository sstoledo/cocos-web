import * as useUserModule from '@/features/shell/hooks/useUser';
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
      user: { role: { name: 'Admin' } },
    } as any);
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
      user: { role: { name: 'Reception' } },
    } as any);
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
        'http://localhost:3000/api/presentations?q=Presentaci%C3%B3n+1',
        { credentials: 'include' }
      )
    );
  });
});

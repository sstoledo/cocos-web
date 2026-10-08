import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDetailPage } from './UserDetailPage';

const mockUser = {
  id: 'u1',
  name: 'Ana García',
  email: 'ana@example.com',
  isActive: true,
  role: { id: 'r1', name: 'Admin' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function createWrapper(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/users/:id', element: children }),
          createElement(Route, {
            path: '/users',
            element: createElement('p', null, 'User list'),
          })
        )
      )
    );
  };
}

function createFetchMock() {
  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/users/roles/all')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: 'r1', name: 'Admin' },
          { id: 'r2', name: 'Mechanic' },
        ],
      });
    }
    if (init?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: async () => mockUser,
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => mockUser,
    });
  });
}

describe('UserDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('deletes the user after confirming in the dialog', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();
    globalThis.fetch = fetchMock;

    render(<UserDetailPage />, { wrapper: createWrapper('/users/u1') });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Eliminar usuario' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar usuario' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(
        '¿Eliminar al usuario Ana García? Esta acción no se puede deshacer.'
      )
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/u1',
        { method: 'DELETE', credentials: 'include' }
      )
    );

    await waitFor(() =>
      expect(screen.getByText('User list')).toBeInTheDocument()
    );
  });

  it('does not delete the user when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();
    globalThis.fetch = fetchMock;

    render(<UserDetailPage />, { wrapper: createWrapper('/users/u1') });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Eliminar usuario' })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar usuario' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar',
      })
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1',
      { method: 'DELETE', credentials: 'include' }
    );
  });
});

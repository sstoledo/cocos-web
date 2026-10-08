import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserListPage } from './UserListPage';

const mockUsers = [
  {
    id: 'u1',
    name: 'Ana García',
    email: 'ana@example.com',
    isActive: true,
    role: { id: 'r1', name: 'Admin' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Pedro López',
    email: 'pedro@example.com',
    isActive: true,
    role: { id: 'r2', name: 'Mechanic' },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

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
      null,
      createElement(QueryClientProvider, { client: queryClient }, children)
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
        json: async () => mockUsers[0],
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({
        data: mockUsers,
        meta: { page: 1, limit: 20, total: 2 },
      }),
    });
  });
}

describe('UserListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('deletes a user after confirming in the dialog', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();
    globalThis.fetch = fetchMock;

    render(<UserListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Eliminar usuario')).toBeInTheDocument();
    expect(
      screen.getByText(
        '¿Eliminar a Ana García? Esta acción no se puede deshacer.'
      )
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Eliminar',
      })
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/u1',
        { method: 'DELETE', credentials: 'include' }
      )
    );
  });

  it('does not delete a user when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock();
    globalThis.fetch = fetchMock;

    render(<UserListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(screen.queryByText('Eliminar usuario')).not.toBeInTheDocument()
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/users/u1',
      { method: 'DELETE', credentials: 'include' }
    );
  });
});

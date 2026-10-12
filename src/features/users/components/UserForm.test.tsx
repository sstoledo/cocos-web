import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserForm } from './UserForm';

const mockEmployees = [
  { id: 'emp-1', name: 'Juan Pérez', specialty: 'Mecánica', userId: null },
  { id: 'emp-2', name: 'María López', specialty: null, userId: 'u-other' },
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
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes('/users/roles/all')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: 'r1', name: 'Admin' }],
      });
    }
    if (url.includes('/employees')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockEmployees,
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

describe('UserForm', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    globalThis.fetch = createFetchMock();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('renders the linked employee select with employees', async () => {
    render(<UserForm onSubmit={vi.fn()} />, { wrapper: createWrapper() });

    const select = await screen.findByLabelText('Empleado vinculado');

    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: 'Juan Pérez' })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('option', { name: 'María López (ya vinculado)' })
    ).toBeInTheDocument();
    expect(select).toBeInTheDocument();
  });

  it('submits the selected employeeId', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<UserForm onSubmit={onSubmit} />, { wrapper: createWrapper() });

    await screen.findByLabelText('Empleado vinculado');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Nombre'), 'Ana García');
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.selectOptions(screen.getByLabelText('Rol'), 'r1');
    await user.selectOptions(
      screen.getByLabelText('Empleado vinculado'),
      'emp-1'
    );
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ employeeId: 'emp-1' })
      )
    );
  });

  it('submits employeeId null when no employee is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<UserForm onSubmit={onSubmit} />, { wrapper: createWrapper() });

    await screen.findByLabelText('Empleado vinculado');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Nombre'), 'Ana García');
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.selectOptions(screen.getByLabelText('Rol'), 'r1');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ employeeId: null })
      )
    );
  });
});

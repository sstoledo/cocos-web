import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Sidebar } from './Sidebar';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderSidebar(role: string, initialEntry = '/') {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Sidebar
          role={role as never}
          userName="Juan Pérez"
          userEmail="juan@example.com"
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Sidebar', () => {
  it('renders the logo mark and brand name', () => {
    renderSidebar('Admin');

    expect(screen.getByText('Cocos')).toBeInTheDocument();
    expect(screen.getByTestId('logo-mark')).toBeInTheDocument();
  });

  it('shows all navigation groups for Admin', () => {
    renderSidebar('Admin');

    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Operaciones')).toBeInTheDocument();
    expect(screen.getByText('Administración')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  it('shows all navigation items for Admin', () => {
    renderSidebar('Admin');

    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /productos/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lotes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /clientes/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /órdenes de trabajo/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ventas/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /devoluciones/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /órdenes de compra/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /usuarios/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /cierre de caja/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /notificaciones/i })
    ).toBeInTheDocument();
  });

  it('marks the active route link with aria-current', () => {
    renderSidebar('Admin', '/products');

    const activeLink = screen.getByRole('link', { name: /productos/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('shows only mechanic links for Mechanic', () => {
    renderSidebar('Mechanic');

    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /órdenes de trabajo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /notificaciones/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /productos/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /clientes/i })).toBeInTheDocument();
  });

  it('shows warehouse links for Warehouse', () => {
    renderSidebar('Warehouse');

    expect(
      screen.getByRole('link', { name: /productos/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lotes/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /órdenes de compra/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /clientes/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /usuarios/i })
    ).not.toBeInTheDocument();
  });

  it('shows only dashboard and notifications for ReadOnly', () => {
    renderSidebar('ReadOnly');

    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /notificaciones/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /clientes/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /productos/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /usuarios/i })
    ).not.toBeInTheDocument();
  });

  it('renders the appearance footer with theme toggle and user menu', () => {
    renderSidebar('Admin');

    expect(screen.getByText('Apariencia')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });
});

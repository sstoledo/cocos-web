import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Sidebar } from './Sidebar';

function renderSidebar(role: string) {
  return render(
    <MemoryRouter>
      <Sidebar role={role as never} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders the brand name', () => {
    renderSidebar('Admin');
    expect(screen.getByText('Cocos')).toBeInTheDocument();
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
    expect(
      screen.queryByRole('link', { name: /clientes/i })
    ).not.toBeInTheDocument();
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
    expect(
      screen.queryByRole('link', { name: /clientes/i })
    ).not.toBeInTheDocument();
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
    expect(
      screen.queryByRole('link', { name: /productos/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /usuarios/i })
    ).not.toBeInTheDocument();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

function renderHeader(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { page: 1, limit: 1, total: 0 } }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps the page title accessible and shows the mobile brand', () => {
    renderHeader(
      <Header title="Productos" userName="Juan" userEmail="juan@example.com" />
    );

    expect(screen.getByText('Productos')).toHaveClass('sr-only');
    expect(screen.getByText('Cocos')).toBeInTheDocument();
  });

  it('does not render the title as a heading', () => {
    renderHeader(
      <Header title="Productos" userName="Juan" userEmail="juan@example.com" />
    );

    expect(
      screen.queryByRole('heading', { name: 'Productos' })
    ).not.toBeInTheDocument();
  });

  it('renders the notification bell', () => {
    renderHeader(
      <Header title="Dashboard" userName="Juan" userEmail="juan@example.com" />
    );

    expect(
      screen.getByRole('button', { name: 'Notificaciones' })
    ).toBeInTheDocument();
  });

  it('shows the hamburger menu button when onMenuClick is provided', () => {
    renderHeader(
      <Header
        title="Dashboard"
        userName="Juan"
        userEmail="juan@example.com"
        onMenuClick={() => {}}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Abrir menú' })
    ).toBeInTheDocument();
  });

  it('hides the hamburger menu button when onMenuClick is not provided', () => {
    renderHeader(
      <Header title="Dashboard" userName="Juan" userEmail="juan@example.com" />
    );

    expect(
      screen.queryByRole('button', { name: 'Abrir menú' })
    ).not.toBeInTheDocument();
  });

  it('calls onMenuClick when the hamburger button is clicked', async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();

    renderHeader(
      <Header
        title="Dashboard"
        userName="Juan"
        userEmail="juan@example.com"
        onMenuClick={onMenuClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('renders theme and profile controls with the menu closed', () => {
    renderHeader(
      <Header title="Dashboard" userName="Juan" userEmail="juan@example.com" />
    );

    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Abrir menú de perfil' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Cerrar sesión' })
    ).not.toBeInTheDocument();
  });
});

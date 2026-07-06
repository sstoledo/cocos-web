import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderLayout(initialEntry = '/dashboard') {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Layout />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const useUserMock = vi.fn();

vi.mock('../hooks/useUser', () => ({
  useUser: () => useUserMock(),
}));

vi.mock('../components/Header', () => ({
  Header: ({
    title,
    onMenuClick,
  }: { title: string; onMenuClick?: () => void }) => (
    <div data-testid="header">
      <span data-testid="header-title">{title}</span>
      {onMenuClick && (
        <button
          type="button"
          data-testid="header-menu-button"
          onClick={onMenuClick}
        >
          Menu
        </button>
      )}
    </div>
  ),
}));

vi.mock('../components/Sidebar', () => ({
  Sidebar: ({
    role,
    userName,
    userEmail,
  }: {
    role: string;
    userName: string;
    userEmail: string;
  }) => (
    <div data-testid="sidebar">
      {role} {userName} {userEmail}
    </div>
  ),
}));

vi.mock('../components/Drawer', () => ({
  Drawer: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
  }) => (
    <div data-testid="drawer" data-open={open}>
      {open && (
        <button
          type="button"
          data-testid="drawer-close"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      )}
      {children}
    </div>
  ),
}));

describe('Layout', () => {
  beforeEach(() => {
    useUserMock.mockReset();
  });

  it('shows loading state while fetching user', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    });

    renderLayout();

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('does not render header or sidebar when user is not authenticated', () => {
    useUserMock.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Layout />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('does not render header or sidebar when user has no role', () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Juan',
        email: 'juan@example.com',
        role: null,
      },
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Layout />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('renders header, sidebar, and passes user props for authenticated user', () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Juan',
        email: 'juan@example.com',
        role: { id: 'r1', name: 'Admin' },
      },
      isLoading: false,
      error: null,
    });

    renderLayout();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toHaveTextContent('Dashboard');
    const sidebars = screen.getAllByTestId('sidebar');
    expect(sidebars[0]).toHaveTextContent('Admin');
    expect(sidebars[0]).toHaveTextContent('Juan');
    expect(sidebars[0]).toHaveTextContent('juan@example.com');
  });

  it('opens the drawer when the header menu button is clicked', async () => {
    useUserMock.mockReturnValue({
      user: {
        id: '1',
        name: 'Juan',
        email: 'juan@example.com',
        role: { id: 'r1', name: 'Admin' },
      },
      isLoading: false,
      error: null,
    });

    renderLayout();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('header-menu-button'));
    expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'true');
  });
});

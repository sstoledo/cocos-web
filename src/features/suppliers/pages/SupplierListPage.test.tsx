import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupplierListPage } from '../pages/SupplierListPage';

const mockSuppliers = [
  {
    id: 's1',
    name: 'Proveedor 1',
    phone: '999111222',
    email: 'p1@example.com',
    address: 'Calle 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    name: 'Proveedor 2',
    phone: null,
    email: null,
    address: null,
    isActive: false,
    deletedAt: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

vi.mock('../hooks/use-suppliers', () => ({
  useSuppliers: vi.fn(),
}));

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '@/features/shell/hooks/useUser';
import { useSuppliers } from '../hooks/use-suppliers';

function renderPage(
  overrides: {
    suppliers?: typeof mockSuppliers;
    isLoading?: boolean;
    error?: Error | null;
    userRole?: string;
  } = {}
) {
  const {
    suppliers = mockSuppliers,
    isLoading = false,
    error = null,
    userRole = 'Admin',
  } = overrides;

  (useSuppliers as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    suppliers,
    isLoading,
    error,
  });

  (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    user: { role: { name: userRole } },
  });

  return render(
    <MemoryRouter initialEntries={['/suppliers']}>
      <QueryClientProvider client={new QueryClient()}>
        <SupplierListPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('SupplierListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderPage();

    expect(screen.getByText('Proveedores')).toBeInTheDocument();
  });

  it('shows "Nuevo proveedor" button for Admin', () => {
    renderPage({ userRole: 'Admin' });

    expect(
      screen.getByRole('link', { name: 'Nuevo proveedor' })
    ).toBeInTheDocument();
  });

  it('shows "Nuevo proveedor" button for Purchasing', () => {
    renderPage({ userRole: 'Purchasing' });

    expect(
      screen.getByRole('link', { name: 'Nuevo proveedor' })
    ).toBeInTheDocument();
  });

  it('hides "Nuevo proveedor" button for Warehouse', () => {
    renderPage({ userRole: 'Warehouse' });

    expect(
      screen.queryByRole('link', { name: 'Nuevo proveedor' })
    ).not.toBeInTheDocument();
  });

  it('renders the suppliers table', () => {
    renderPage();

    expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    expect(screen.getByText('Proveedor 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderPage({ isLoading: true });

    expect(screen.getByText('Cargando proveedores…')).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderPage({ error: new Error('Failed') });

    expect(
      screen.getByText(
        'No se pudieron cargar los proveedores. Intentá de nuevo más tarde.'
      )
    ).toBeInTheDocument();
  });
});

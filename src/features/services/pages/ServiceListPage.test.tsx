import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Service, ServiceListResponse } from '../types';
import { ServiceListPage } from './ServiceListPage';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

type ReactNode = React.ReactNode;

const service: Service = {
  id: 'srv-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  price: '150.00',
  estimatedDuration: 30,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockResponse: ServiceListResponse = {
  data: [service],
  meta: { page: 1, limit: 10, total: 1 },
};

describe('ServiceListPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/services']}>
        <ServiceListPage />
      </MemoryRouter>,
      { wrapper: createWrapper() }
    );
  }

  it('shows loading state initially', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Cargando servicios…')).toBeInTheDocument();
  });

  it('shows services table when loaded', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('SRV-001')).toBeInTheDocument();
      expect(screen.getByText('Cambio de aceite')).toBeInTheDocument();
    });
  });

  it('shows error state when request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(
          'No se pudieron cargar los servicios. Intentá de nuevo más tarde.'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows "Nuevo servicio" button', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Nuevo servicio' })
      ).toHaveAttribute('href', '/services/new');
    });
  });

  it('shows empty state when no services', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } }),
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('No se encontraron servicios.')
      ).toBeInTheDocument();
    });
  });

  it('renders pagination when there is more than one page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [service],
        meta: { page: 2, limit: 10, total: 30 },
      }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
    });
  });
});

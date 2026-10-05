import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../types';
import { ServiceDetailPage } from './ServiceDetailPage';

const service: Service = {
  id: 'svc-1',
  code: 'SRV-001',
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: '25000.00',
  estimatedDuration: 45,
  isActive: true,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

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
      { initialEntries: ['/services/svc-1'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/services/:id', element: children })
        )
      )
    );
  };
}

describe('ServiceDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function renderPage(fetchMock: typeof globalThis.fetch) {
    globalThis.fetch = fetchMock;
    return render(<ServiceDetailPage />, { wrapper: createWrapper() });
  }

  it('shows loading state initially', () => {
    renderPage(vi.fn().mockImplementation(() => new Promise(() => {})));

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows service info when loaded', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/services/svc-1')) {
        return Promise.resolve({ ok: true, json: async () => service });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }) as unknown as typeof fetch;

    renderPage(fetchMock);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Cambio de aceite' })
      ).toBeInTheDocument()
    );

    expect(screen.getByText('SRV-001')).toBeInTheDocument();
    expect(screen.getByText(/\$[\s\u00A0]?25\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Cambio de aceite y filtro')).toBeInTheDocument();
  });

  it('shows error state when request fails', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/services/svc-1')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }) as unknown as typeof fetch;

    renderPage(fetchMock);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
      )
    );
  });
});

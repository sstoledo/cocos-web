import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CashClosing, CashClosingListResponse } from '../types';
import { CashClosingsListPage } from './CashClosingsListPage';

const API = 'http://localhost:3000/api';

function buildClosing(overrides: Partial<CashClosing> = {}): CashClosing {
  return {
    id: 'cc1',
    periodStart: '2026-09-23T10:00:00.000Z',
    periodEnd: '2026-09-23T20:00:00.000Z',
    expectedCash: '1250.00',
    expectedCard: '3400.50',
    expectedTransfer: '800.00',
    declaredCash: '1300.00',
    difference: '50.00',
    salesCount: 12,
    notes: null,
    createdAt: '2026-09-23T20:00:00.000Z',
    closedBy: { id: 'u1', name: 'Ana García' },
    ...overrides,
  };
}

const singlePageResponse: CashClosingListResponse = {
  data: [buildClosing()],
  meta: { page: 1, limit: 10, total: 1 },
};

const multiPageResponse: CashClosingListResponse = {
  data: [buildClosing()],
  meta: { page: 1, limit: 10, total: 25 },
};

function mockFetchWith(response: object) {
  return vi.fn().mockImplementation(async () => ({
    ok: true,
    json: async () => response,
  }));
}

function createWrapper(initialEntries?: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries },
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
  };
}

function lastListUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  const [url] = fetchMock.mock.calls.at(-1) as [string];
  return new URL(url);
}

describe('CashClosingsListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders rows with es-AR dates and decimal strings verbatim', async () => {
    globalThis.fetch = mockFetchWith(singlePageResponse);

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Ana García' })
      ).toBeInTheDocument()
    );

    for (const column of [
      'Fecha de cierre',
      'Cerrado por',
      'Ventas',
      'Efectivo esperado',
      'Efectivo declarado',
      'Diferencia',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: column })
      ).toBeInTheDocument();
    }

    expect(screen.getByRole('cell', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1250.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1300.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '50.00' })).toBeInTheDocument();
    // periodEnd formatted as es-AR date, never raw ISO.
    expect(screen.queryByText(/2026-09-23T/)).not.toBeInTheDocument();
  });

  it.each([
    ['50.00', 'text-green-700'],
    ['-25.00', 'text-destructive'],
  ])('highlights the difference %s with %s', async (difference, className) => {
    globalThis.fetch = mockFetchWith({
      data: [buildClosing({ difference })],
      meta: { page: 1, limit: 10, total: 1 },
    });

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('cell', { name: difference })).toHaveClass(
        className
      )
    );
  });

  it('renders a zero difference with neutral styling', async () => {
    globalThis.fetch = mockFetchWith({
      data: [buildClosing({ difference: '0.00' })],
      meta: { page: 1, limit: 10, total: 1 },
    });

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('cell', { name: '0.00' })).toBeInTheDocument()
    );
    const cell = screen.getByRole('cell', { name: '0.00' });
    expect(cell).not.toHaveClass('text-destructive');
    expect(cell).not.toHaveClass('text-green-700');
  });

  it('shows a loading skeleton while the list loads', () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    expect(
      screen.getByLabelText('Cargando cierres de caja')
    ).toBeInTheDocument();
  });

  it('shows a voseo error state when the request fails', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    }));

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los cierres de caja. Intentá de nuevo más tarde.'
      )
    );
  });

  it('shows an empty state when there are no closings yet', async () => {
    globalThis.fetch = mockFetchWith({
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    });

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Todavía no hay cierres.')).toBeInTheDocument()
    );
  });

  it('reads the initial page from the URL', async () => {
    const fetchMock = mockFetchWith(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<CashClosingsListPage />, {
      wrapper: createWrapper(['/cash-closings?page=2']),
    });

    await waitFor(() =>
      expect(lastListUrl(fetchMock).searchParams.get('page')).toBe('2')
    );
  });

  it('navigates to the next page through the URL', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWith(multiPageResponse);
    globalThis.fetch = fetchMock;

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    );

    await testUser.click(
      screen.getByRole('button', { name: 'Página siguiente' })
    );

    await waitFor(() =>
      expect(lastListUrl(fetchMock).searchParams.get('page')).toBe('2')
    );
  });

  it('navigates to the closing detail when a row is clicked', async () => {
    const testUser = userEvent.setup();
    globalThis.fetch = mockFetchWith(singlePageResponse);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/cash-closings']}>
          <Routes>
            <Route path="/cash-closings" element={<CashClosingsListPage />} />
            <Route
              path="/cash-closings/:id"
              element={<div>Detalle del cierre cc1</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const row = await screen.findByRole('row', { name: /Ana García/ });
    // Keyboard/AT path: the date cell carries a real link to the detail.
    expect(within(row).getByRole('link')).toHaveAttribute(
      'href',
      '/cash-closings/cc1'
    );

    await testUser.click(within(row).getByText('Ana García'));

    expect(
      await screen.findByText('Detalle del cierre cc1')
    ).toBeInTheDocument();
  });

  it('links the header button to the close page', () => {
    globalThis.fetch = mockFetchWith(singlePageResponse);

    render(<CashClosingsListPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /cerrar caja/i })).toHaveAttribute(
      'href',
      '/cash-closings/close'
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateCashClosingPdf } from '../lib/cash-closing-pdf';
import type { CashClosing } from '../types';
import { CashClosingDetailPage } from './CashClosingDetailPage';

vi.mock('../lib/cash-closing-pdf', () => ({
  generateCashClosingPdf: vi.fn(),
}));

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
    notes: 'Cierre del turno',
    createdAt: '2026-09-23T20:05:00.000Z',
    closedBy: { id: 'u1', name: 'Ana García' },
    ...overrides,
  };
}

function mockFetchWith(behavior: {
  status?: number;
  body?: unknown;
}) {
  const status = behavior.status ?? 200;
  return vi.fn().mockImplementation(async () => ({
    ok: status < 400,
    status,
    json: async () => behavior.body ?? buildClosing(),
  }));
}

function renderPage(id = 'cc1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[`/cash-closings/${id}`]}>
        <Routes>
          <Route
            path="/cash-closings/:id"
            element={<CashClosingDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </Wrapper>
  );
}

describe('CashClosingDetailPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows a loading state while the closing loads', () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;

    renderPage();

    expect(screen.getByText('Cargando cierre de caja…')).toBeInTheDocument();
  });

  it('renders all closing fields with es-AR dates and verbatim amounts', async () => {
    globalThis.fetch = mockFetchWith({});

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );

    for (const label of [
      'Inicio del período',
      'Fin del período',
      'Registrado',
      'Cerrado por',
      'Efectivo esperado',
      'Tarjeta esperada',
      'Transferencia esperada',
      'Efectivo declarado',
      'Diferencia',
      'Ventas',
      'Notas',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    expect(screen.getByText('1250.00')).toBeInTheDocument();
    expect(screen.getByText('3400.50')).toBeInTheDocument();
    expect(screen.getByText('800.00')).toBeInTheDocument();
    expect(screen.getByText('1300.00')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Cierre del turno')).toBeInTheDocument();
    // Dates render localized, never raw ISO.
    expect(screen.queryByText(/2026-09-23T/)).not.toBeInTheDocument();
  });

  it('highlights a positive difference in green', async () => {
    globalThis.fetch = mockFetchWith({});

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('50.00')).toHaveClass('text-green-700')
    );
  });

  it('highlights a negative difference in red', async () => {
    globalThis.fetch = mockFetchWith({
      body: buildClosing({ declaredCash: '1200.00', difference: '-50.00' }),
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('-50.00')).toHaveClass('text-destructive')
    );
  });

  it('renders a zero difference with neutral styling', async () => {
    globalThis.fetch = mockFetchWith({
      body: buildClosing({ declaredCash: '1250.00', difference: '0.00' }),
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('0.00')).toBeInTheDocument());
    const difference = screen.getByText('0.00');
    expect(difference).not.toHaveClass('text-destructive');
    expect(difference).not.toHaveClass('text-green-700');
  });

  it('renders a dash when the closing has no notes', async () => {
    globalThis.fetch = mockFetchWith({
      body: buildClosing({ notes: null }),
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a friendly voseo message on 404 with a link back to the list', async () => {
    globalThis.fetch = mockFetchWith({
      status: 404,
      body: { message: 'Not found', errorCode: 'CASH_CLOSING_NOT_FOUND' },
    });

    renderPage('missing');

    await waitFor(() =>
      expect(
        screen.getByText('El cierre de caja no existe o fue eliminado.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('link', { name: 'Volver a cierres de caja' })
    ).toHaveAttribute('href', '/cash-closings');
  });

  it('shows a voseo error state when the request fails', async () => {
    globalThis.fetch = mockFetchWith({ status: 500, body: {} });

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
      )
    );
  });

  it('renders the PDF download button enabled', async () => {
    globalThis.fetch = mockFetchWith({});

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: /descargar pdf/i })
    ).toBeEnabled();
  });

  it('generates the PDF with the loaded closing on click', async () => {
    const user = userEvent.setup();
    const closing = buildClosing();
    globalThis.fetch = mockFetchWith({ body: closing });

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: /descargar pdf/i }));

    await waitFor(() =>
      expect(generateCashClosingPdf).toHaveBeenCalledWith(closing)
    );
  });
});

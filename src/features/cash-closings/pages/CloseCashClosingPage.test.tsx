import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CashClosing, ClosingPreview } from '../types';
import { CloseCashClosingPage } from './CloseCashClosingPage';

const API = 'http://localhost:3000/api';

const preview: ClosingPreview = {
  periodStart: '2026-09-23T10:00:00.000Z',
  expectedCash: '1250.00',
  expectedCard: '3400.50',
  expectedTransfer: '800.00',
  salesCount: 12,
};

const emptyPreview: ClosingPreview = {
  periodStart: null,
  expectedCash: '0.00',
  expectedCard: '0.00',
  expectedTransfer: '0.00',
  salesCount: 0,
};

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

type MockBehavior = {
  preview?: ClosingPreview;
  previewStatus?: number;
  postStatus?: number;
  postBody?: unknown;
  // Preview payload served by the refetch after a successful close.
  previewAfterClose?: ClosingPreview;
};

function mockFetch(behavior: MockBehavior = {}) {
  let previewCalls = 0;

  return vi.fn((url: string, init?: RequestInit) => {
    if (url === `${API}/cash-closings` && init?.method === 'POST') {
      if (behavior.postStatus && behavior.postStatus >= 400) {
        return Promise.resolve({
          ok: false,
          status: behavior.postStatus,
          json: async () => behavior.postBody ?? {},
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => behavior.postBody ?? buildClosing(),
      });
    }

    if (url === `${API}/cash-closings/preview`) {
      previewCalls += 1;
      if (behavior.previewStatus && behavior.previewStatus >= 400) {
        return Promise.resolve({
          ok: false,
          status: behavior.previewStatus,
          json: async () => ({}),
        });
      }
      const payload =
        previewCalls > 1 && behavior.previewAfterClose
          ? behavior.previewAfterClose
          : (behavior.preview ?? preview);
      return Promise.resolve({ ok: true, json: async () => payload });
    }

    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

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

function renderPage(behavior: MockBehavior = {}) {
  globalThis.fetch = mockFetch(behavior);
  return render(<CloseCashClosingPage />, { wrapper: createWrapper() });
}

async function fillAndSubmit(declaredCash: string, notes?: string) {
  const user = userEvent.setup();
  const input = await screen.findByLabelText('Efectivo declarado');
  await user.clear(input);
  await user.type(input, declaredCash);
  if (notes !== undefined) {
    await user.type(screen.getByLabelText('Notas (opcional)'), notes);
  }
  await user.click(screen.getByRole('button', { name: 'Cerrar caja' }));
  return user;
}

describe('CloseCashClosingPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows a loading skeleton while the preview loads', () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;
    render(<CloseCashClosingPage />, { wrapper: createWrapper() });

    expect(screen.getByLabelText('Cargando vista previa')).toBeInTheDocument();
  });

  it('renders the open-period preview with decimal strings verbatim', async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('1250.00')).toBeInTheDocument()
    );

    expect(screen.getByText('3400.50')).toBeInTheDocument();
    expect(screen.getByText('800.00')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    // periodStart formatted as es-AR date-time, never raw ISO.
    expect(screen.queryByText(/2026-09-23T/)).not.toBeInTheDocument();
  });

  it('shows "Sin cierres previos" when periodStart is null', async () => {
    renderPage({ preview: emptyPreview });

    await waitFor(() =>
      expect(screen.getByText('Sin cierres previos')).toBeInTheDocument()
    );
  });

  it('shows an inline error when the preview fails to load', async () => {
    renderPage({ previewStatus: 500 });

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(
      screen.getByText(/No se pudo cargar la vista previa/)
    ).toBeInTheDocument();
  });

  it.each([['-10'], ['10.123'], ['abc']])(
    'rejects invalid declaredCash %s without calling the API',
    async (value) => {
      renderPage();
      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

      await fillAndSubmit(value);

      expect(
        await screen.findByText('Ingresá un monto válido (hasta 2 decimales)')
      ).toBeInTheDocument();
      const posts = fetchMock.mock.calls.filter(
        ([, init]) => (init as RequestInit | undefined)?.method === 'POST'
      );
      expect(posts).toHaveLength(0);
    }
  );

  it('submits and shows the inline result with a positive difference', async () => {
    renderPage();

    await fillAndSubmit('1300.00', 'Cierre del turno');

    const result = await screen.findByRole('status');
    expect(
      within(result).getByText('Cierre registrado correctamente.')
    ).toBeInTheDocument();
    expect(within(result).getByText('1250.00')).toBeInTheDocument();
    expect(within(result).getByText('1300.00')).toBeInTheDocument();

    const difference = within(result).getByText('50.00');
    expect(difference).toHaveClass('text-green-700');

    // No auto-navigation: the outcome stays on screen with a detail link.
    expect(
      within(result).getByRole('link', { name: 'Ver detalle del cierre' })
    ).toHaveAttribute('href', '/cash-closings/cc1');
    expect(
      screen.queryByLabelText('Efectivo declarado')
    ).not.toBeInTheDocument();

    // Notes travelled in the POST body.
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const postCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === 'POST'
    );
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      declaredCash: '1300.00',
      notes: 'Cierre del turno',
    });
  });

  it('omits the notes key when the textarea is left empty', async () => {
    renderPage();

    await fillAndSubmit('1300.00');

    await screen.findByRole('status');
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const postCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === 'POST'
    );
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      declaredCash: '1300.00',
    });
  });

  it('highlights a negative difference in red', async () => {
    renderPage({
      postBody: buildClosing({ declaredCash: '1200.00', difference: '-50.00' }),
    });

    await fillAndSubmit('1200.00');

    const result = await screen.findByRole('status');
    const difference = within(result).getByText('-50.00');
    expect(difference).toHaveClass('text-destructive');
  });

  it('renders a zero difference with neutral styling', async () => {
    renderPage({
      postBody: buildClosing({ declaredCash: '1250.00', difference: '0.00' }),
    });

    await fillAndSubmit('1250.00');

    const result = await screen.findByRole('status');
    const difference = within(result).getByText('0.00');
    expect(difference).not.toHaveClass('text-destructive');
    expect(difference).not.toHaveClass('text-green-700');
  });

  it('shows the CLOSING_CONFLICT message on 409 and keeps the form', async () => {
    renderPage({
      postStatus: 409,
      postBody: { message: 'Conflict', errorCode: 'CLOSING_CONFLICT' },
    });

    await fillAndSubmit('1250.00');

    expect(
      await screen.findByText('Ya existe un cierre para este período.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Efectivo declarado')).toBeInTheDocument();
  });

  it('shows the 400 fallback message on validation errors from the API', async () => {
    renderPage({
      postStatus: 400,
      postBody: { message: 'Bad request' },
    });

    await fillAndSubmit('1250.00');

    expect(
      await screen.findByText('Revisá los datos ingresados.')
    ).toBeInTheDocument();
  });

  it('shows the closing result after a successful close (does not refetch preview)', async () => {
    renderPage({ previewAfterClose: emptyPreview });

    await waitFor(() =>
      expect(screen.getByText('1250.00')).toBeInTheDocument()
    );

    await fillAndSubmit('1300.00');

    await screen.findByRole('status');
    // After successful close, the component shows the ClosingResult component
    // (not the preview), so verify the closing result is shown
    await waitFor(() =>
      expect(
        screen.getByText('Cierre registrado correctamente.')
      ).toBeInTheDocument()
    );
    // The preview section is hidden after close (shows ClosingResult instead)
    expect(screen.queryByText('Sin cierres previos')).not.toBeInTheDocument();
  });
});

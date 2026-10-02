import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardSummary } from '../types';
import { DashboardPage } from './DashboardPage';

const summary: DashboardSummary = {
  salesTodayCount: 4,
  salesMonthCount: 87,
  workOrders: { pending: 3, inProgress: 2, done: 41, cancelled: 1 },
  purchaseOrders: {
    draft: 2,
    ordered: 5,
    partiallyReceived: 1,
    received: 18,
    cancelled: 0,
  },
  notificationsUnread: 7,
  generatedAt: '2026-09-23T15:30:00.000Z',
};

const useDashboardSummaryMock = vi.fn();

vi.mock('../hooks/use-dashboard-summary', () => ({
  useDashboardSummary: () => useDashboardSummaryMock(),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderPage() {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, null, children, <LocationProbe />);
  }

  return render(<DashboardPage />, { wrapper: Wrapper });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useDashboardSummaryMock.mockReset();
  });

  it('renders the six stat cards with real values from the summary', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary,
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ventas de hoy')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Ventas del mes')).toBeInTheDocument();
    expect(screen.getByText('87')).toBeInTheDocument();
    expect(screen.getByText('Órdenes pendientes')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Órdenes en curso')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('OC por recibir')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones sin leer')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('sums ordered and partially received for the OC por recibir card', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary,
      isLoading: false,
      error: null,
    });

    renderPage();

    // ordered (5) + partiallyReceived (1) = 6
    const card = screen.getByText('OC por recibir').closest('a');
    expect(card).toHaveTextContent('6');
  });

  it('links the cards to their list pages', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary,
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('Ventas de hoy').closest('a')).toHaveAttribute(
      'href',
      '/sales'
    );
    expect(screen.getByText('Ventas del mes').closest('a')).toHaveAttribute(
      'href',
      '/sales'
    );
    expect(screen.getByText('Órdenes pendientes').closest('a')).toHaveAttribute(
      'href',
      '/work-orders'
    );
    expect(screen.getByText('Órdenes en curso').closest('a')).toHaveAttribute(
      'href',
      '/work-orders'
    );
    expect(screen.getByText('OC por recibir').closest('a')).toHaveAttribute(
      'href',
      '/purchase-orders'
    );
    expect(
      screen.getByText('Notificaciones sin leer').closest('a')
    ).toHaveAttribute('href', '/notifications');
  });

  it('navigates to /notifications when the notifications card is clicked', async () => {
    useDashboardSummaryMock.mockReturnValue({
      summary,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Notificaciones sin leer'));

    expect(screen.getByTestId('location')).toHaveTextContent('/notifications');
  });

  it('renders skeleton cards while loading without fake values', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: undefined,
      isLoading: true,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole('status', { name: /cargando estadísticas/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Ventas de hoy')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones sin leer')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.queryByText('87')).not.toBeInTheDocument();
  });

  it('shows the parsed API error message when the summary fails to load', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: undefined,
      isLoading: false,
      error: new Error('Failed to fetch dashboard summary: 500'),
    });

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to fetch dashboard summary: 500'
    );
  });

  it('does not render the removed recent activity section', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary,
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.queryByText('Actividad reciente')).not.toBeInTheDocument();
  });
});

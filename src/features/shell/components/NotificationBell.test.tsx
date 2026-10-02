import type { NotificationListResponse } from '@/features/notifications/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './NotificationBell';

function unreadResponse(total: number): NotificationListResponse {
  return { data: [], meta: { page: 1, limit: 1, total } };
}

function mockFetchUnread(total: number) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => unreadResponse(total),
  });
  globalThis.fetch = fetchMock;
  return fetchMock;
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderBell() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      <MemoryRouter>
        {children}
        <LocationProbe />
      </MemoryRouter>
    );
  }

  return render(<NotificationBell />, { wrapper: Wrapper });
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('renders a bell button labelled "Notificaciones" when there are no unread', async () => {
    mockFetchUnread(0);

    renderBell();

    expect(
      await screen.findByRole('button', { name: 'Notificaciones' })
    ).toBeInTheDocument();
  });

  it('shows the unread count in the badge and exposes it via aria-label', async () => {
    mockFetchUnread(3);

    renderBell();

    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Notificaciones, 3 sin leer' })
    ).toBeInTheDocument();
  });

  it('hides the badge when the unread count is zero', async () => {
    const fetchMock = mockFetchUnread(0);

    renderBell();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {});

    expect(
      screen.getByRole('button', { name: 'Notificaciones' })
    ).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('caps the badge at 99+ when the count exceeds 99', async () => {
    mockFetchUnread(150);

    renderBell();

    expect(await screen.findByText('99+')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Notificaciones, 150 sin leer' })
    ).toBeInTheDocument();
  });

  it('navigates to /notifications when clicked', async () => {
    mockFetchUnread(2);
    const user = userEvent.setup();

    renderBell();

    await user.click(
      await screen.findByRole('button', { name: /notificaciones/i })
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/notifications');
  });

  it('polls the unread count every 30 seconds', async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetchUnread(2);

    renderBell();

    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('renders the bell without a badge when the count request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'boom' }),
    });
    globalThis.fetch = fetchMock;

    renderBell();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {});

    expect(
      screen.getByRole('button', { name: 'Notificaciones' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\d/)).not.toBeInTheDocument();
  });
});

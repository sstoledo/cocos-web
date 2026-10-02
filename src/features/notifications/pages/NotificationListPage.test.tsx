import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, createElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Notification, NotificationListResponse } from '../types';
import { NotificationListPage } from './NotificationListPage';

// jsdom lacks PointerEvent; base-ui Switch needs it (Switch.test.tsx precedent).
if (typeof PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {}
  globalThis.PointerEvent =
    PointerEventPolyfill as typeof globalThis.PointerEvent;
}

const unreadNotification: Notification = {
  id: 'n1',
  type: 'work_order_ready',
  title: 'Orden WO-0001 lista',
  body: 'La orden de trabajo está lista para retirar',
  link: '/work-orders/wo1',
  readAt: null,
  createdAt: '2026-09-23T12:00:00.000Z',
};

const readNotification: Notification = {
  id: 'n2',
  type: 'purchase_order_received',
  title: 'OC COM-2024-000001 recibida',
  body: 'Se registró la recepción completa de la orden de compra',
  link: '/purchase-orders/po1',
  readAt: '2026-09-22T15:30:00.000Z',
  createdAt: '2026-09-22T10:00:00.000Z',
};

const paginatedResponse: NotificationListResponse = {
  data: [unreadNotification, readNotification],
  meta: { page: 1, limit: 10, total: 2 },
};

const multiPageResponse: NotificationListResponse = {
  data: [unreadNotification, readNotification],
  meta: { page: 1, limit: 10, total: 25 },
};

const emptyResponse: NotificationListResponse = {
  data: [],
  meta: { page: 1, limit: 10, total: 0 },
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

type MockFetchOptions = {
  list?: NotificationListResponse;
  unreadTotal?: number;
  failList?: boolean;
  failPatch?: boolean;
};

// The page fires two GET queries (list + unread-count badge at limit=1) plus
// PATCH mutations; dispatch by method and URL like the F10 harness does.
function mockFetchWithNotifications({
  list = paginatedResponse,
  unreadTotal = 1,
  failList = false,
  failPatch = false,
}: MockFetchOptions = {}) {
  return vi
    .fn()
    .mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === 'PATCH') {
        if (failPatch) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ message: 'boom' }),
          };
        }
        return {
          ok: true,
          json: async () =>
            url.endsWith('/read-all')
              ? { count: 2 }
              : { ...unreadNotification, readAt: '2026-09-23T13:00:00.000Z' },
        };
      }
      if (failList) {
        return { ok: false, status: 500, json: async () => ({}) };
      }
      // The unread-count query uses limit=1; the page list uses limit=10.
      if (new URL(url).searchParams.get('limit') === '1') {
        return {
          ok: true,
          json: async () => ({
            data: [],
            meta: { page: 1, limit: 1, total: unreadTotal },
          }),
        };
      }
      return { ok: true, json: async () => list };
    });
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
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
  const listCalls = fetchMock.mock.calls.filter((call) => {
    const url = new URL(String(call[0]));
    return (
      url.pathname.endsWith('/notifications') &&
      url.searchParams.get('limit') !== '1' &&
      (call[1] as RequestInit | undefined)?.method !== 'PATCH'
    );
  });
  const [url] = listCalls.at(-1) as [string];
  return new URL(url);
}

function patchCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(
    (call) => (call[1] as RequestInit | undefined)?.method === 'PATCH'
  );
}

describe('NotificationListPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders notifications with badge, title, body and date', async () => {
    globalThis.fetch = mockFetchWithNotifications();

    render(<NotificationListPage />, { wrapper: createWrapper() });

    const unreadItem = await screen.findByRole('button', {
      name: /Orden WO-0001 lista/,
    });

    expect(within(unreadItem).getByText('Orden lista')).toBeInTheDocument();
    expect(
      within(unreadItem).getByText(
        'La orden de trabajo está lista para retirar'
      )
    ).toBeInTheDocument();
    expect(
      within(unreadItem).getByText(formatDateTime(unreadNotification.createdAt))
    ).toBeInTheDocument();
    expect(within(unreadItem).getByText('Sin leer')).toBeInTheDocument();

    const readItem = screen.getByRole('button', {
      name: /OC COM-2024-000001 recibida/,
    });
    expect(within(readItem).getByText('OC recibida')).toBeInTheDocument();
    expect(within(readItem).queryByText('Sin leer')).not.toBeInTheDocument();
  });

  it('shows a loading state and then the list', async () => {
    globalThis.fetch = mockFetchWithNotifications();

    render(<NotificationListPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cargando notificaciones…')).toBeInTheDocument();

    await screen.findByRole('button', { name: /Orden WO-0001 lista/ });
  });

  it('shows an empty state when there are no notifications', async () => {
    globalThis.fetch = mockFetchWithNotifications({
      list: emptyResponse,
      unreadTotal: 0,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText('No tenés notificaciones.')).toBeInTheDocument()
    );
  });

  it('shows an error state when the request fails', async () => {
    globalThis.fetch = mockFetchWithNotifications({ failList: true });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron cargar las notificaciones'
      )
    );
  });

  it('toggles the unread filter via the switch and resets the page', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications({ list: multiPageResponse });
    globalThis.fetch = fetchMock;

    render(<NotificationListPage />, {
      wrapper: createWrapper(['/notifications?page=2']),
    });

    await waitFor(() =>
      expect(
        screen.queryByText('Cargando notificaciones…')
      ).not.toBeInTheDocument()
    );
    expect(lastListUrl(fetchMock).searchParams.get('page')).toBe('2');
    expect(lastListUrl(fetchMock).searchParams.get('unread')).toBeNull();

    await testUser.click(
      screen.getByRole('switch', { name: 'Solo no leídas' })
    );

    await waitFor(() => {
      const url = lastListUrl(fetchMock);
      expect(url.searchParams.get('unread')).toBe('true');
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('reads the initial unread filter from the URL', async () => {
    const fetchMock = mockFetchWithNotifications();
    globalThis.fetch = fetchMock;

    render(<NotificationListPage />, {
      wrapper: createWrapper(['/notifications?unread=true']),
    });

    expect(
      screen.getByRole('switch', { name: 'Solo no leídas' })
    ).toHaveAttribute('aria-checked', 'true');

    await waitFor(() =>
      expect(lastListUrl(fetchMock).searchParams.get('unread')).toBe('true')
    );
  });

  it('navigates to the next page', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications({ list: multiPageResponse });
    globalThis.fetch = fetchMock;

    render(<NotificationListPage />, { wrapper: createWrapper() });

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

  it('marks an unread notification as read and navigates to its link', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications();
    globalThis.fetch = fetchMock;

    render(
      <>
        <NotificationListPage />
        <LocationProbe />
      </>,
      { wrapper: createWrapper() }
    );

    const unreadItem = await screen.findByRole('button', {
      name: /Orden WO-0001 lista/,
    });
    await testUser.click(unreadItem);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/work-orders/wo1'
      )
    );

    const patches = patchCalls(fetchMock);
    expect(patches).toHaveLength(1);
    expect(String(patches[0][0])).toBe(
      'http://localhost:3000/api/notifications/n1/read'
    );
  });

  it('navigates to the link without PATCH when already read', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications();
    globalThis.fetch = fetchMock;

    render(
      <>
        <NotificationListPage />
        <LocationProbe />
      </>,
      { wrapper: createWrapper() }
    );

    const readItem = await screen.findByRole('button', {
      name: /OC COM-2024-000001 recibida/,
    });
    await testUser.click(readItem);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/purchase-orders/po1'
      )
    );
    expect(patchCalls(fetchMock)).toHaveLength(0);
  });

  it('shows an inline error when marking as read fails', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications({ failPatch: true });
    globalThis.fetch = fetchMock;

    render(
      <>
        <NotificationListPage />
        <LocationProbe />
      </>,
      { wrapper: createWrapper(['/notifications']) }
    );

    const unreadItem = await screen.findByRole('button', {
      name: /Orden WO-0001 lista/,
    });
    await testUser.click(unreadItem);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo marcar la notificación como leída'
      )
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/notifications');
  });

  it('marks all notifications as read from the header button', async () => {
    const testUser = userEvent.setup();
    const fetchMock = mockFetchWithNotifications();
    globalThis.fetch = fetchMock;

    render(<NotificationListPage />, { wrapper: createWrapper() });

    const markAllButton = await screen.findByRole('button', {
      name: 'Marcar todas como leídas',
    });
    await waitFor(() => expect(markAllButton).toBeEnabled());

    await testUser.click(markAllButton);

    await waitFor(() =>
      expect(
        patchCalls(fetchMock).some((call) =>
          String(call[0]).endsWith('/notifications/read-all')
        )
      ).toBe(true)
    );
  });

  it('disables the mark-all button when there are no unread notifications', async () => {
    globalThis.fetch = mockFetchWithNotifications({
      list: {
        data: [readNotification],
        meta: { page: 1, limit: 10, total: 1 },
      },
      unreadTotal: 0,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await screen.findByRole('button', {
      name: /OC COM-2024-000001 recibida/,
    });

    expect(
      screen.getByRole('button', { name: 'Marcar todas como leídas' })
    ).toBeDisabled();
  });
});

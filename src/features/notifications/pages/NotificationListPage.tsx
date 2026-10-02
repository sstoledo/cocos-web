import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { Switch } from '@/components/ui/Switch';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { NotificationList } from '../components/NotificationList';
import { useMarkAllNotificationsRead } from '../hooks/use-mark-all-notifications-read';
import { useMarkNotificationRead } from '../hooks/use-mark-notification-read';
import { useNotifications } from '../hooks/use-notifications';
import { useUnreadNotificationsCount } from '../hooks/use-unread-notifications-count';
import type { ListNotificationsParams, Notification } from '../types';

const DEFAULT_LIMIT = 10;

function paramsFromSearchParams(
  searchParams: URLSearchParams
): ListNotificationsParams {
  return {
    unread: searchParams.get('unread') === 'true' ? true : undefined,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    limit: DEFAULT_LIMIT,
  };
}

function searchParamsFromParams(
  params: ListNotificationsParams,
  page: number
): URLSearchParams {
  const nextSearchParams = new URLSearchParams();

  if (params.unread) {
    nextSearchParams.set('unread', 'true');
  }

  nextSearchParams.set('page', page.toString());

  return nextSearchParams;
}

export function NotificationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = paramsFromSearchParams(searchParams);
  const { notifications, meta, isLoading, error } = useNotifications(params);
  const { unreadCount } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);

  function handleUnreadOnlyChange(unreadOnly: boolean) {
    // Any filter change resets pagination to the first page.
    setSearchParams(
      searchParamsFromParams({ ...params, unread: unreadOnly || undefined }, 1),
      { replace: true }
    );
  }

  function handlePageChange(page: number) {
    setSearchParams(searchParamsFromParams(params, page), { replace: true });
  }

  function handleNotificationClick(notification: Notification) {
    setActionError(null);

    // Already read: navigate directly without a PATCH (F11 decision).
    if (notification.readAt !== null) {
      navigate(notification.link);
      return;
    }

    markRead.mutate(notification.id, {
      onSuccess: () => navigate(notification.link),
      onError: () =>
        setActionError(
          'No se pudo marcar la notificación como leída. Intentá de nuevo.'
        ),
    });
  }

  function handleMarkAllRead() {
    setActionError(null);
    markAllRead.mutate(undefined, {
      onError: () =>
        setActionError(
          'No se pudieron marcar las notificaciones como leídas. Intentá de nuevo.'
        ),
    });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Notificaciones</PageTitle>
        <Button
          type="button"
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
        >
          Marcar todas como leídas
        </Button>
      </PageHeader>
      <PageContent>
        <SectionCard title="Listado de notificaciones">
          <div className="space-y-4">
            <Switch
              label="Solo no leídas"
              checked={params.unread === true}
              onCheckedChange={(checked) =>
                handleUnreadOnlyChange(checked === true)
              }
            />
            {actionError && (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {actionError}
              </div>
            )}
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando notificaciones…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar las notificaciones. Intentá de nuevo más
                tarde.
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                unreadOnly={params.unread === true}
                onNotificationClick={handleNotificationClick}
              />
            )}
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={handlePageChange} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}

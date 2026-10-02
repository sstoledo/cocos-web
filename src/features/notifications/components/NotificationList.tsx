import { cn } from '@/lib/utils';
import type { Notification } from '../types';
import { NotificationTypeBadge } from './NotificationTypeBadge';

export type NotificationListProps = {
  notifications: Notification[];
  unreadOnly: boolean;
  onNotificationClick: (notification: Notification) => void;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function NotificationList({
  notifications,
  unreadOnly,
  onNotificationClick,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        {unreadOnly
          ? 'No tenés notificaciones sin leer.'
          : 'No tenés notificaciones.'}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {notifications.map((notification) => {
        const isUnread = notification.readAt === null;

        return (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => onNotificationClick(notification)}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <span className="flex w-3 shrink-0 justify-center pt-1.5">
                {isUnread && (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-primary"
                    />
                    <span className="sr-only">Sin leer</span>
                  </>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <NotificationTypeBadge type={notification.type} />
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(notification.createdAt)}
                  </span>
                </span>
                <span
                  className={cn(
                    'mt-1 block truncate text-sm text-foreground',
                    isUnread ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {notification.title}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {notification.body}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

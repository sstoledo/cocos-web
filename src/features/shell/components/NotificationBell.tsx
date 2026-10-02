import { useUnreadNotificationsCount } from '@/features/notifications/hooks/use-unread-notifications-count';
import { cn } from '@/lib/utils';
import { IconBell } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

// F11 decision: the bell polls the unread count every 30 seconds.
const POLL_INTERVAL_MS = 30_000;
const BADGE_CAP = 99;

export function NotificationBell() {
  const navigate = useNavigate();
  // The hook returns 0 while loading or on error, so a broken count never
  // breaks the shell — the badge simply stays hidden.
  const { unreadCount } = useUnreadNotificationsCount(POLL_INTERVAL_MS);

  const label =
    unreadCount > 0
      ? `Notificaciones, ${unreadCount} sin leer`
      : 'Notificaciones';

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      aria-label={label}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <IconBell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-primary-foreground"
        >
          {unreadCount > BADGE_CAP ? `${BADGE_CAP}+` : unreadCount}
        </span>
      )}
    </button>
  );
}

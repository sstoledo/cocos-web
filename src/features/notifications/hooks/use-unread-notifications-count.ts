import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '../api/list-notifications';

// Unread badge count: GET /notifications?unread=true&limit=1 → meta.total.
// The caller decides polling (the shell bell passes refetchInterval=30_000).
export function useUnreadNotificationsCount(refetchInterval?: number) {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => listNotifications({ unread: true, limit: 1 }),
    refetchInterval,
  });

  return { unreadCount: data?.meta.total ?? 0 };
}

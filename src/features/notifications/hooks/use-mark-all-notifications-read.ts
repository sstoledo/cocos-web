import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead } from '../api/mark-all-notifications-read';

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      // Prefix invalidation covers list variants and the unread-count badge.
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

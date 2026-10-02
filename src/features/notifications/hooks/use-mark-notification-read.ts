import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationRead } from '../api/mark-notification-read';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      // Prefix invalidation covers every ['notifications', params] list
      // variant plus the ['notifications', 'unread-count'] badge query.
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

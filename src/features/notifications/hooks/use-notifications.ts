import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '../api/list-notifications';
import type { ListNotificationsParams } from '../types';

export function useNotifications(params: ListNotificationsParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => listNotifications(params),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    notifications: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

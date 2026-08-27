import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { getWorkOrders } from '../api/get-work-orders';
import type { WorkOrderListFilters } from '../types';

export function useWorkOrders(filters: WorkOrderListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => getWorkOrders(filters),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    workOrders: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

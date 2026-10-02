import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { listCashClosings } from '../api/list-cash-closings';
import type { ListCashClosingsParams } from '../types';

export function useCashClosings(params: ListCashClosingsParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cash-closings', params],
    queryFn: () => listCashClosings(params),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    cashClosings: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

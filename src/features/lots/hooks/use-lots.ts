import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { getLots } from '../api/get-lots';
import type { LotListFilters } from '../types';

export function useLots(filters: LotListFilters = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lots', 'list', filters],
    queryFn: () => getLots(filters),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    lots: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

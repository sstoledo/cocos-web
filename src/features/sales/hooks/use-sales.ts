import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { getSales } from '../api/get-sales';
import type { SaleListFilters } from '../types';

export function useSales(filters: SaleListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sales', filters],
    queryFn: () => getSales(filters),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    sales: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

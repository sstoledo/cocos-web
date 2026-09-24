import type { PaginationMeta } from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrders } from '../api/get-purchase-orders';
import type { PurchaseOrderListFilters } from '../types';

export function usePurchaseOrders(filters: PurchaseOrderListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-orders', 'list', filters],
    queryFn: () => getPurchaseOrders(filters),
  });

  const meta: PaginationMeta | undefined = data
    ? {
        page: data.meta.page,
        total: data.meta.total,
        totalPages: Math.ceil(data.meta.total / data.meta.limit),
      }
    : undefined;

  return {
    purchaseOrders: data?.data ?? [],
    meta,
    isLoading,
    error,
  };
}

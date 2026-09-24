import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrder } from '../api/get-purchase-order';

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => getPurchaseOrder(id),
    enabled: Boolean(id),
  });
}

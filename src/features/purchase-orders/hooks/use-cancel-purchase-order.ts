import { ApiError } from '@/lib/api-error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelPurchaseOrder } from '../api/cancel-purchase-order';

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelPurchaseOrder(id),
    onSuccess: (_purchaseOrder, id) => {
      // ['purchase-orders'] prefix covers every list variant (incl. status
      // filters); ['purchase-order', id] flips the detail badge without a
      // refresh (use-cancel-sale precedent).
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
    onError: (error, id) => {
      // 409: someone else transitioned the order first — re-fetch so the
      // badge/list reflect the true state (SaleCancelAction precedent).
      if (error instanceof ApiError && error.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      }
    },
  });
}

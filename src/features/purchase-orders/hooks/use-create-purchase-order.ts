import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPurchaseOrder } from '../api/create-purchase-order';
import type { CreatePurchaseOrderPayload } from '../types';

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) =>
      createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

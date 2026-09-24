import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePurchaseOrder } from '../api/update-purchase-order';
import type { UpdatePurchaseOrderPayload } from '../types';

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePurchaseOrderPayload;
    }) => updatePurchaseOrder(id, payload),
    onSuccess: (_purchaseOrder, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receivePurchaseOrder } from '../api/receive-purchase-order';
import type { ReceivePurchaseOrderPayload } from '../types';

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReceivePurchaseOrderPayload;
    }) => receivePurchaseOrder(id, payload),
    onSuccess: (_purchaseOrder, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      // Receiving creates lots and changes product stock, so the lots list
      // and products list go stale too.
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}

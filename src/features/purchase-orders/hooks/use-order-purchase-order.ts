import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderPurchaseOrder } from '../api/order-purchase-order';

export function useOrderPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderPurchaseOrder(id),
    onSuccess: (_purchaseOrder, id) => {
      // ['purchase-orders'] prefix covers every list variant (incl. status
      // filters); ['purchase-order', id] flips the detail badge without a
      // refresh (use-cancel-sale precedent).
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      toast.success('Orden enviada correctamente');
    },
  });
}

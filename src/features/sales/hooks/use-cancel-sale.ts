import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelSale } from '../api/cancel-sale';

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSale(id),
    onSuccess: (_sale, id) => {
      // ['sales'] prefix covers every list variant (incl. status filters);
      // ['sale', id] flips the detail badge without a refresh (SL-F14).
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      toast.success('Venta cancelada correctamente');
    },
  });
}

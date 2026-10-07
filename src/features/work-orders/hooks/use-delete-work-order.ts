import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteWorkOrder } from '../api/delete-work-order';

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Orden de trabajo eliminada correctamente');
    },
    onError: () => {
      toast.error('No se pudo eliminar la orden de trabajo');
    },
  });
}

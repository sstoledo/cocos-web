import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkOrder } from '../api/delete-work-order';

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

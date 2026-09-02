import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkOrder } from '../api/update-work-order';
import type { UpdateWorkOrderPayload } from '../types';

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkOrderPayload;
    }) => updateWorkOrder(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
    },
  });
}

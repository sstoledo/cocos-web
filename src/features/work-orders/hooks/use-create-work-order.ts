import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkOrder } from '../api/create-work-order';
import type { CreateWorkOrderPayload } from '../types';

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) => createWorkOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

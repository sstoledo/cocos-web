import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transitionWorkOrderStatus } from '../api/transition-work-order-status';
import type { WorkOrderStatus } from '../types';

export function useTransitionWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) =>
      transitionWorkOrderStatus(id, { status }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
    },
  });
}

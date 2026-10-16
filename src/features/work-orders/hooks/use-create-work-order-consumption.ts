import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createWorkOrderConsumption } from '../api/create-work-order-consumption';
import type { CreateConsumptionPayload } from '../types';

export function useCreateWorkOrderConsumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      payload,
    }: {
      workOrderId: string;
      payload: CreateConsumptionPayload;
    }) => createWorkOrderConsumption(workOrderId, payload),
    onSuccess: (_data, { workOrderId }) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-consumptions', workOrderId],
      });
      // Consumption moves stock and may open/deplete containers.
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Consumo registrado correctamente');
    },
  });
}

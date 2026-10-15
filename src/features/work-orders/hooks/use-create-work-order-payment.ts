import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createWorkOrderPayment } from '../api/create-work-order-payment';
import type { CreateWorkOrderPaymentPayload } from '../types';

export function useCreateWorkOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      payload,
    }: {
      workOrderId: string;
      payload: CreateWorkOrderPaymentPayload;
    }) => createWorkOrderPayment(workOrderId, payload),
    onSuccess: (_data, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      queryClient.invalidateQueries({
        queryKey: ['work-order-payments', workOrderId],
      });
      toast.success('Pago registrado correctamente');
    },
  });
}

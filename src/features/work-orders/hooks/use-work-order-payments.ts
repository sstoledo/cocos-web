import { useQuery } from '@tanstack/react-query';
import { getWorkOrderPayments } from '../api/get-work-order-payments';

export function useWorkOrderPayments(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-payments', workOrderId],
    queryFn: () => getWorkOrderPayments(workOrderId),
    enabled: Boolean(workOrderId),
  });
}

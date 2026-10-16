import { useQuery } from '@tanstack/react-query';
import { getWorkOrderConsumptions } from '../api/get-work-order-consumptions';

export function useWorkOrderConsumptions(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-consumptions', workOrderId],
    queryFn: () => getWorkOrderConsumptions(workOrderId),
    enabled: Boolean(workOrderId),
  });
}

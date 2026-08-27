import { useQuery } from '@tanstack/react-query';
import { getWorkOrder } from '../api/get-work-order';

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: () => getWorkOrder(id),
    enabled: Boolean(id),
  });
}

import { useQuery } from '@tanstack/react-query';
import { getReceipt } from '../api/get-receipt';

export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['receipts', 'detail', id],
    queryFn: () => getReceipt(id),
    enabled: Boolean(id),
  });
}

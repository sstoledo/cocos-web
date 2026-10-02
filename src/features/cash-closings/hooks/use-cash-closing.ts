import { useQuery } from '@tanstack/react-query';
import { getCashClosing } from '../api/get-cash-closing';

export function useCashClosing(id: string) {
  return useQuery({
    queryKey: ['cash-closings', 'detail', id],
    queryFn: () => getCashClosing(id),
    enabled: Boolean(id),
  });
}

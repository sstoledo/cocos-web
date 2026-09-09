import { useQuery } from '@tanstack/react-query';
import { getSale } from '../api/get-sale';

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSale(id),
    enabled: Boolean(id),
  });
}

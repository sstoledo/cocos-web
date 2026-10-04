import { useQuery } from '@tanstack/react-query';
import { getBrand } from '../api/get-brand';

export function useBrand(id: string) {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => getBrand(id),
    enabled: Boolean(id),
  });
}

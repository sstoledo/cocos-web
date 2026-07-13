import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/get-product';

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
}

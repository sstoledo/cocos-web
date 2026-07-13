import { useQuery } from '@tanstack/react-query';
import { getProductMovements } from '../api/get-product-movements';

export function useProductMovements(productId: string) {
  return useQuery({
    queryKey: ['stock', 'movements', productId],
    queryFn: () => getProductMovements(productId),
    enabled: Boolean(productId),
  });
}

import { useQuery } from '@tanstack/react-query';
import { getProductStock } from '../api/get-product-stock';

export function useProductStock(productId: string) {
  return useQuery({
    queryKey: ['stock', 'product', productId],
    queryFn: () => getProductStock(productId),
    enabled: Boolean(productId),
  });
}

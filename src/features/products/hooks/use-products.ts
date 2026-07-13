import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/get-products';
import type { ProductListFilters } from '../types';

export function useProducts(filters: ProductListFilters) {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: () => getProducts(filters),
  });

  return { products, isLoading, error };
}

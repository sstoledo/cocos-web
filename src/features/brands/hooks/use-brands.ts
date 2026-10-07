import { useQuery } from '@tanstack/react-query';
import { getBrands } from '../api/get-brands';
import type { BrandListFilters } from '../types';

export function useBrands(filters: BrandListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['brands', 'list', filters],
    queryFn: () => getBrands(filters),
  });

  return {
    brands: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

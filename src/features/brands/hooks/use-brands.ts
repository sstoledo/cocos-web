import { useQuery } from '@tanstack/react-query';
import { getBrands } from '../api/get-brands';
import type { BrandListFilters } from '../types';

export function useBrands(filters: BrandListFilters) {
  const {
    data: brands = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['brands', 'list', filters],
    queryFn: () => getBrands(filters),
  });

  return { brands, isLoading, error };
}

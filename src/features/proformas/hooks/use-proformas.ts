import { useQuery } from '@tanstack/react-query';
import { getProformas } from '../api/get-proformas';
import type { ProformaListFilters } from '../types';

export function useProformas(filters: ProformaListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proformas', filters],
    queryFn: () => getProformas(filters),
  });

  return {
    proformas: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

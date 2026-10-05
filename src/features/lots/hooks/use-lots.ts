import { useQuery } from '@tanstack/react-query';
import { getLots } from '../api/get-lots';
import type { LotListFilters } from '../types';

export function useLots(filters: LotListFilters = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lots', 'list', filters],
    queryFn: () => getLots(filters),
  });

  return {
    lots: data?.data ?? [],
    isLoading,
    error,
  };
}

import { useQuery } from '@tanstack/react-query';
import { getLots } from '../api/get-lots';
import type { LotListFilters } from '../types';

export function useLots(filters: LotListFilters = {}) {
  const {
    data: lots = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lots', 'list', filters],
    queryFn: () => getLots(filters),
  });

  return { lots, isLoading, error };
}

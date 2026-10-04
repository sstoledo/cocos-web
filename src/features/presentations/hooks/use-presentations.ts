import { useQuery } from '@tanstack/react-query';
import { getPresentations } from '../api/get-presentations';
import type { PresentationListFilters } from '../types';

export function usePresentations(filters: PresentationListFilters) {
  const {
    data: presentations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['presentations', 'list', filters],
    queryFn: () => getPresentations(filters),
  });

  return { presentations, isLoading, error };
}

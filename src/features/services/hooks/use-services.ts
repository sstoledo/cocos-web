import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/get-services';
import type { ServiceListFilters } from '../types';

export function useServices(filters: ServiceListFilters) {
  const {
    data: services = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['services', 'list', filters],
    queryFn: () => getServices(filters),
  });

  return { services, isLoading, error };
}

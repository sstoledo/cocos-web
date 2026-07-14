import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/get-vehicles';
import type { GetVehiclesFilters } from '../api/get-vehicles';

export function useVehicles(filters: GetVehiclesFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', filters.clientId, filters],
    queryFn: () => getVehicles(filters),
    enabled: Boolean(filters.clientId),
  });

  return {
    vehicles: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

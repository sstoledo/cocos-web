import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/get-vehicles';
import type { VehicleListFilters } from '../types';

export function useVehicles(filters: VehicleListFilters) {
  const {
    data: paginatedResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vehicles', 'list', filters],
    queryFn: () => getVehicles(filters),
  });

  return {
    vehicles: paginatedResponse?.data ?? [],
    meta: paginatedResponse?.meta,
    isLoading,
    error,
  };
}

import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/get-vehicles';
import type { GetVehiclesFilters } from '../api/get-vehicles';

function toPaginationMeta(
  meta: { page: number; limit: number; total: number } | undefined
) {
  if (!meta) return undefined;
  return {
    page: meta.page,
    total: meta.total,
    totalPages: Math.ceil(meta.total / meta.limit),
  };
}

export function useVehicles(filters: GetVehiclesFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', filters.clientId, filters],
    queryFn: () => getVehicles(filters),
    enabled: Boolean(filters.clientId),
  });

  return {
    vehicles: data?.data ?? [],
    meta: toPaginationMeta(data?.meta),
    isLoading,
    error,
  };
}

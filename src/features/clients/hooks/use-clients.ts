import { useQuery } from '@tanstack/react-query';
import { getClients } from '../api/get-clients';
import type { ClientListFilters } from '../types';

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

export function useClients(filters: ClientListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => getClients(filters),
  });

  return {
    clients: data?.data ?? [],
    meta: data?.meta ? toPaginationMeta(data.meta) : undefined,
    isLoading,
    error,
  };
}

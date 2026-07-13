import { useQuery } from '@tanstack/react-query';
import { getClients } from '../api/get-clients';
import type { ClientListFilters } from '../types';

export function useClients(filters: ClientListFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => getClients(filters),
  });

  return {
    clients: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

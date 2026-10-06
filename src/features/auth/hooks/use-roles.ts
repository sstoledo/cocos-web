import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../api/get-roles';
import type { Role } from '../types';

export function useRoles() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'roles'],
    queryFn: getRoles,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    roles: (data as Role[]) ?? [],
    isLoading,
  };
}

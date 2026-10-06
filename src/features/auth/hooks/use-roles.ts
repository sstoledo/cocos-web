import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../api/get-roles';
import type { Role } from '../types';

export function useRoles() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'roles'],
    queryFn: getRoles,
    staleTime: Infinity,
  });

  return {
    roles: (data as Role[]) ?? [],
    isLoading,
  };
}
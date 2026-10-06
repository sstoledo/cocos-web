import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/get-users';
import type { UserListFilters } from '../types';

export function useUsers(filters: UserListFilters = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: () => getUsers(filters),
  });

  return {
    users: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

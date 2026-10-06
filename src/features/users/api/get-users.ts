import type { UserListFilters, UserListResponse } from '../types';

export async function getUsers(
  filters: UserListFilters = {}
): Promise<UserListResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.roleId) params.set('roleId', filters.roleId);
  if (filters.isActive) params.set('isActive', filters.isActive);
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 20));

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/users?${params.toString()}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  return (await response.json()) as UserListResponse;
}

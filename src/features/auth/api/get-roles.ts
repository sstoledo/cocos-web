import type { Role } from '@/features/auth/types';

export async function getRoles(): Promise<Role[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/users/roles/all`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`);
  }

  return (await response.json()) as Role[];
}
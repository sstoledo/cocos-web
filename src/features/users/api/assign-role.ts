import type { User } from '../types';

export interface AssignRolePayload {
  roleId: string;
}

export async function assignRole(
  id: string,
  payload: AssignRolePayload
): Promise<User> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/users/${id}/role`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to assign role: ${response.status}`
    );
  }

  return (await response.json()) as User;
}

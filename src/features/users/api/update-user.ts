import type { User } from '../types';

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to update user: ${response.status}`
    );
  }

  return (await response.json()) as User;
}

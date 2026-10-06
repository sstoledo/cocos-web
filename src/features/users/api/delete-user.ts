import type { User } from '../types';

export async function deleteUser(id: string): Promise<User> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to delete user: ${response.status}`
    );
  }

  return (await response.json()) as User;
}

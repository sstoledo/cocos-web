import type { User } from '../types';

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return (await response.json()) as User;
}

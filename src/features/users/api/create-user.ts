import type { User } from '../types';

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  roleId: string;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to create user: ${response.status}`
    );
  }

  return (await response.json()) as User;
}

import type { Client } from '../types';

export async function getClient(id: string): Promise<Client> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/clients/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch client: ${response.status}`);
  }

  return (await response.json()) as Client;
}

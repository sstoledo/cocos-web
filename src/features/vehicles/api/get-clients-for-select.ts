import type { ClientSelectOption } from '../types';

export async function getClientsForSelect(): Promise<ClientSelectOption[]> {
  const url = `${import.meta.env.VITE_API_URL}/clients?limit=100&page=1`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: Array<{ id: string; name: string }>;
  };

  return data.data.map((client) => ({
    id: client.id,
    name: client.name,
  }));
}

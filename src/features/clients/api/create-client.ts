import type { Client, ClientFormValues } from '../types';

export async function createClient(values: ClientFormValues): Promise<Client> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to create client: ${response.status}`);
  }

  return (await response.json()) as Client;
}

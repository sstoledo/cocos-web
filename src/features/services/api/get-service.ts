import type { Service } from '../types';

export async function getService(id: string): Promise<Service> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch service: ${response.status}`);
  }

  return (await response.json()) as Service;
}

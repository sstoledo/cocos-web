import type { Vehicle } from '../types';

export async function getVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/vehicles/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicle: ${response.status}`);
  }

  return (await response.json()) as Vehicle;
}

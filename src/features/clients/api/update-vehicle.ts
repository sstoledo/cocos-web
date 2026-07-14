import type { Vehicle, VehicleFormValues } from '../types';

export async function updateVehicle(
  id: string,
  values: VehicleFormValues
): Promise<Vehicle> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/vehicles/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update vehicle: ${response.status}`);
  }

  return (await response.json()) as Vehicle;
}

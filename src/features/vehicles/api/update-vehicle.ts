import type { Vehicle, VehicleFormValues } from '../types';

export async function updateVehicle(
  id: string,
  values: Partial<VehicleFormValues>
): Promise<Vehicle> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/vehicles/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(values.plate !== undefined && { plate: values.plate }),
        ...(values.brand !== undefined && { brand: values.brand }),
        ...(values.model !== undefined && { model: values.model }),
        ...(values.year !== undefined && { year: values.year }),
        ...(values.color !== undefined && { color: values.color }),
        ...(values.notes !== undefined && { notes: values.notes }),
        ...(values.clientId !== undefined && { clientId: values.clientId }),
        ...(values.isActive !== undefined && { isActive: values.isActive }),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update vehicle: ${response.status}`);
  }

  return (await response.json()) as Vehicle;
}

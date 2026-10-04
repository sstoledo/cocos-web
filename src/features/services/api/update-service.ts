import type { Service, ServiceFormValues } from '../types';

export async function updateService(
  id: string,
  values: Partial<ServiceFormValues>
): Promise<Service> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/services/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(values.code !== undefined && { code: values.code }),
        ...(values.name !== undefined && { name: values.name }),
        ...(values.description !== undefined && {
          description: values.description,
        }),
        ...(values.price !== undefined && { price: values.price }),
        ...(values.estimatedDuration !== undefined && {
          estimatedDuration: values.estimatedDuration,
        }),
        ...(values.isActive !== undefined && { isActive: values.isActive }),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update service: ${response.status}`);
  }

  return (await response.json()) as Service;
}

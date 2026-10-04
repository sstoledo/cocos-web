import type { Service, ServiceFormValues } from '../types';

export async function createService(
  values: ServiceFormValues
): Promise<Service> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/services`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: values.code,
      name: values.name,
      description: values.description,
      price: values.price,
      estimatedDuration: values.estimatedDuration,
      isActive: values.isActive,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create service: ${response.status}`);
  }

  return (await response.json()) as Service;
}

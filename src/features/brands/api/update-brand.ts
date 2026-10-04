import type { Brand, BrandFormValues } from '../types';

export async function updateBrand(
  id: string,
  values: Partial<BrandFormValues>
): Promise<Brand> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/brands/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to update brand: ${response.status}`);
  }

  return (await response.json()) as Brand;
}

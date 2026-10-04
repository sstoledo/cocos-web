import type { Brand, BrandFormValues } from '../types';

export async function createBrand(values: BrandFormValues): Promise<Brand> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/brands`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to create brand: ${response.status}`);
  }

  return (await response.json()) as Brand;
}

import type { Brand } from '../types';

export async function getBrand(id: string): Promise<Brand> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/brands/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brand: ${response.status}`);
  }

  return (await response.json()) as Brand;
}

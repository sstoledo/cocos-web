import type { Supplier } from '../types';

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch supplier: ${response.status}`);
  }

  return (await response.json()) as Supplier;
}

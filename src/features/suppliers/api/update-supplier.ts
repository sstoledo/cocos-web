import type { Supplier, SupplierFormValues } from '../types';

export async function updateSupplier(
  id: string,
  values: Partial<SupplierFormValues>
): Promise<Supplier> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
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
    throw new Error(`Failed to update supplier: ${response.status}`);
  }

  return (await response.json()) as Supplier;
}

import type { Supplier, SupplierFormValues } from '../types';

export async function createSupplier(
  values: SupplierFormValues
): Promise<Supplier> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Failed to create supplier: ${response.status}`);
  }

  return (await response.json()) as Supplier;
}

export type Supplier = {
  id: string;
  name: string;
};

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.data as Supplier[];
}

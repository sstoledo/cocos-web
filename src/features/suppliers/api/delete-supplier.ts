export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete supplier: ${response.status}`);
  }
}

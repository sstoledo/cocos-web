export async function deleteBrand(id: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/brands/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete brand: ${response.status}`);
  }
}

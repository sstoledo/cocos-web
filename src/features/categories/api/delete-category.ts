export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/categories/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.status}`);
  }
}

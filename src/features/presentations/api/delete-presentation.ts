export async function deletePresentation(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/presentations/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete presentation: ${response.status}`);
  }
}

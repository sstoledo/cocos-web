export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/clients/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete client: ${response.status}`);
  }
}

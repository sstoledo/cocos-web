export async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/vehicles/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete vehicle: ${response.status}`);
  }
}

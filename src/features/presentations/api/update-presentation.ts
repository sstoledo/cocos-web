import type { Presentation, PresentationFormValues } from '../types';

export async function updatePresentation(
  id: string,
  values: Partial<PresentationFormValues>
): Promise<Presentation> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/presentations/${id}`,
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
    throw new Error(`Failed to update presentation: ${response.status}`);
  }

  return (await response.json()) as Presentation;
}

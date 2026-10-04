import type { Presentation, PresentationFormValues } from '../types';

export async function createPresentation(
  values: PresentationFormValues
): Promise<Presentation> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/presentations`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create presentation: ${response.status}`);
  }

  return (await response.json()) as Presentation;
}

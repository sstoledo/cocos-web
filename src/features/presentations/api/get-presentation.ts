import type { Presentation } from '../types';

export async function getPresentation(id: string): Promise<Presentation> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/presentations/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch presentation: ${response.status}`);
  }

  return (await response.json()) as Presentation;
}

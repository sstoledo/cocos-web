import type { OpenContainersInfo } from '../types';

export async function getOpenContainers(
  productId: string
): Promise<OpenContainersInfo> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/stock/products/${productId}/open-containers`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch open containers: ${response.status}`);
  }

  return (await response.json()) as OpenContainersInfo;
}

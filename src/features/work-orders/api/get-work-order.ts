import type { WorkOrder } from '../types';

export async function getWorkOrder(id: string): Promise<WorkOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${id}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch work order: ${response.status}`);
  }

  return (await response.json()) as WorkOrder;
}

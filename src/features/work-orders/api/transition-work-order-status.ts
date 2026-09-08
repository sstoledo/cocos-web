import { parseApiError } from '@/lib/api-error';
import type { WorkOrder, WorkOrderStatus } from '../types';

export async function transitionWorkOrderStatus(
  id: string,
  payload: { status: WorkOrderStatus }
): Promise<WorkOrder> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${id}/status`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: payload.status }),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to transition work order');
  }

  return (await response.json()) as WorkOrder;
}

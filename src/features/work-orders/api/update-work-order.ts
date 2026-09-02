import { parseApiError } from '@/lib/api-error';
import type { UpdateWorkOrderPayload, WorkOrder } from '../types';

export async function updateWorkOrder(
  id: string,
  payload: UpdateWorkOrderPayload
): Promise<WorkOrder> {
  const body = {
    clientId: payload.clientId,
    vehicleId: payload.vehicleId,
    description: payload.description,
    // Backend rejects provided-but-empty arrays; omit empty line-type keys.
    ...(payload.services?.length ? { services: payload.services } : {}),
    ...(payload.products?.length ? { products: payload.products } : {}),
  };

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${id}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update work order');
  }

  return (await response.json()) as WorkOrder;
}

import { parseApiError } from '@/lib/api-error';
import type { CreateWorkOrderPayload, WorkOrder } from '../types';

export async function createWorkOrder(
  payload: CreateWorkOrderPayload
): Promise<WorkOrder> {
  const body = {
    clientId: payload.clientId,
    vehicleId: payload.vehicleId,
    description: payload.description,
    // Backend rejects provided-but-empty arrays; omit empty line-type keys.
    ...(payload.services?.length ? { services: payload.services } : {}),
    ...(payload.products?.length ? { products: payload.products } : {}),
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/work-orders`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create work order');
  }

  return (await response.json()) as WorkOrder;
}

import { parseApiError } from '@/lib/api-error';
import type { WorkOrderPayment } from '../types';

export async function getWorkOrderPayments(
  workOrderId: string
): Promise<WorkOrderPayment[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${workOrderId}/payments`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch work order payments');
  }

  return (await response.json()) as WorkOrderPayment[];
}

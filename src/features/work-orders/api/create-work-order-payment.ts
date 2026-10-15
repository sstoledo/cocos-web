import { ApiError } from '@/lib/api-error';
import type { CreateWorkOrderPaymentPayload, WorkOrderPayment } from '../types';

interface ErrorBody {
  message?: string;
  errorCode?: string;
}

export async function createWorkOrderPayment(
  workOrderId: string,
  payload: CreateWorkOrderPaymentPayload
): Promise<WorkOrderPayment> {
  const note = payload.note?.trim();
  const body = {
    // The backend contract takes a JSON number with at most 2 decimals.
    amount: Number(payload.amount),
    paymentMethod: payload.paymentMethod,
    ...(note ? { note } : {}),
  };

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/work-orders/${workOrderId}/payments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    // Keep the server message: WORK_ORDER_OVERPAYMENT embeds the remaining
    // balance and the error mapper surfaces it in Spanish.
    let bodyJson: ErrorBody | undefined;
    try {
      bodyJson = (await response.json()) as ErrorBody;
    } catch {
      bodyJson = undefined;
    }
    throw new ApiError(
      bodyJson?.message ??
        `Failed to create work order payment: ${response.status}`,
      response.status,
      bodyJson?.errorCode
    );
  }

  return (await response.json()) as WorkOrderPayment;
}

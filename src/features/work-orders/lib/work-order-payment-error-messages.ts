import { ApiError } from '@/lib/api-error';

// The backend embeds the remaining balance in the WORK_ORDER_OVERPAYMENT
// message (e.g. "… remaining balance 150.00"); surface it when present.
const REMAINING_BALANCE_PATTERN = /(\d+([.,]\d{1,2})?)/g;

function overpaymentMessage(serverMessage: string): string {
  // The balance is the last amount in the server message (the payment
  // amount may appear earlier).
  const matches = [...serverMessage.matchAll(REMAINING_BALANCE_PATTERN)];
  const balance = matches.at(-1)?.[1];
  if (balance) {
    return `El monto supera el saldo restante de la orden (saldo: ${balance}).`;
  }
  return 'El monto supera el saldo restante de la orden.';
}

const WORK_ORDER_PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  WORK_ORDER_NOT_FOUND: 'La orden no existe o fue eliminada.',
  WORK_ORDER_CANCELLED: 'No se pueden registrar pagos en una orden cancelada.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo registrar el pago. Intentá de nuevo más tarde.';

export function getWorkOrderPaymentErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode === 'WORK_ORDER_OVERPAYMENT') {
      return overpaymentMessage(error.message);
    }

    if (error.errorCode && WORK_ORDER_PAYMENT_ERROR_MESSAGES[error.errorCode]) {
      return WORK_ORDER_PAYMENT_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 403) {
      return 'No tenés permisos para registrar pagos.';
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

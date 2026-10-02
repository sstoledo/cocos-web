import { ApiError } from '@/lib/api-error';

// Codes transcribed from the B13 backend contract (obs #1292).
const CASH_CLOSING_ERROR_MESSAGES: Record<string, string> = {
  CLOSING_CONFLICT: 'Ya existe un cierre para este período.',
  CASH_CLOSING_NOT_FOUND: 'El cierre de caja no existe o fue eliminado.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo completar la operación. Intentá de nuevo más tarde.';

export function getCashClosingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode && CASH_CLOSING_ERROR_MESSAGES[error.errorCode]) {
      return CASH_CLOSING_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

import { ApiError } from '@/lib/api-error';
import type { InsufficientStockDetail } from '../types';

function insufficientStockMessage(details: unknown): string {
  if (Array.isArray(details) && details.length > 0) {
    const detail = details[0] as Partial<InsufficientStockDetail>;
    if (
      typeof detail.requested === 'number' &&
      typeof detail.available === 'number'
    ) {
      return `Stock insuficiente: solicitaste ${detail.requested} y hay ${detail.available} disponible(s).`;
    }
  }
  return 'No hay stock suficiente de este producto.';
}

const CONSUMPTION_ERROR_MESSAGES: Record<string, string> = {
  WORK_ORDER_NOT_FOUND: 'La orden no existe o fue eliminada.',
  WORK_ORDER_CLOSED:
    'No se puede registrar consumo en una orden finalizada o cancelada.',
  PRODUCT_NOT_FOUND: 'El producto no existe o fue eliminado.',
  CONSUMPTION_TYPE_NOT_ALLOWED: 'Este producto no admite ese tipo de evento.',
  CONSUMPTION_QUANTITY_REQUIRED:
    'La cantidad es obligatoria para este tipo de evento.',
  NO_OPEN_CONTAINER: 'No hay ningún envase abierto de este producto.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo registrar el consumo. Intentá de nuevo más tarde.';

export function getWorkOrderConsumptionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode === 'INSUFFICIENT_STOCK') {
      return insufficientStockMessage(error.details);
    }

    if (error.errorCode && CONSUMPTION_ERROR_MESSAGES[error.errorCode]) {
      return CONSUMPTION_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 403) {
      return 'No tenés permisos para registrar consumo en esta orden.';
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

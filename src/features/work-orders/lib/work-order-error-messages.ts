import { ApiError } from '@/lib/api-error';
import type { WorkOrderProductLine } from '../types';

const WORK_ORDER_ERROR_MESSAGES: Record<string, string> = {
  CLIENT_NOT_FOUND: 'El cliente seleccionado no existe o está inactivo.',
  VEHICLE_NOT_FOUND: 'El vehículo seleccionado no existe o está inactivo.',
  SERVICE_NOT_FOUND: 'Uno de los servicios no existe o está inactivo.',
  PRODUCT_NOT_FOUND: 'Uno de los productos no existe o está inactivo.',
  VEHICLE_CLIENT_MISMATCH: 'El vehículo no pertenece al cliente seleccionado.',
  WORK_ORDER_EMPTY_LINES: 'Agregá al menos un servicio o producto.',
  INVALID_STATUS_TRANSITION:
    'El estado de la orden ya cambió. Actualizamos los datos.',
  WORK_ORDER_NOT_FOUND: 'La orden no existe o fue eliminada.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo guardar la orden. Intentá de nuevo más tarde.';

export interface WorkOrderErrorContext {
  products?: WorkOrderProductLine[];
}

interface InsufficientStockDetail {
  productId?: unknown;
}

function isInsufficientStockDetails(
  details: unknown
): details is InsufficientStockDetail[] {
  return Array.isArray(details) && details.length > 0;
}

function resolveProductName(
  error: ApiError,
  ctx?: WorkOrderErrorContext
): string | undefined {
  if (!isInsufficientStockDetails(error.details)) {
    return undefined;
  }

  const productId = error.details[0]?.productId;
  if (typeof productId !== 'string') {
    return undefined;
  }

  const line = ctx?.products?.find(
    (productLine) => productLine.productId === productId
  );

  return line ? `${line.product.code} ${line.product.name}` : productId;
}

export function getWorkOrderErrorMessage(
  error: unknown,
  ctx?: WorkOrderErrorContext
): string {
  if (error instanceof ApiError) {
    if (error.errorCode === 'INSUFFICIENT_STOCK') {
      const product = resolveProductName(error, ctx);
      return product
        ? `No hay stock suficiente de ${product} para completar la orden.`
        : 'No hay stock suficiente para completar la orden.';
    }

    if (error.errorCode && WORK_ORDER_ERROR_MESSAGES[error.errorCode]) {
      return WORK_ORDER_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

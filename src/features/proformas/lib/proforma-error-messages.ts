import type { Product } from '@/features/products/types';
import { ApiError } from '@/lib/api-error';

const PROFORMA_ERROR_MESSAGES: Record<string, string> = {
  PROFORMA_EMPTY_LINES: 'Agregá al menos un producto.',
  CLIENT_NOT_FOUND: 'El cliente seleccionado no existe o está inactivo.',
  PRODUCT_NOT_FOUND: 'Uno de los productos no existe o está inactivo.',
  BRANCH_NOT_FOUND: 'La sucursal seleccionada no existe o está inactiva.',
  EMPLOYEE_NOT_FOUND: 'El empleado seleccionado no existe o está inactivo.',
  PROFORMA_NOT_FOUND: 'La proforma no existe o fue eliminada.',
  PROFORMA_NOT_DRAFT: 'Solo se pueden editar proformas en borrador.',
  PROFORMA_NOT_ACCEPTED: 'Solo se pueden convertir proformas aceptadas.',
  INVALID_STATUS_TRANSITION: 'No se puede cambiar a ese estado.',
  PROFORMA_DUPLICATE_LINE: 'No podés cargar el mismo producto dos veces.',
};

const UNKNOWN_FALLBACK =
  'No se pudo procesar la proforma. Intentá de nuevo más tarde.';

export interface ProformaErrorContext {
  products?: Product[];
}

interface InsufficientStockDetail {
  productId?: unknown;
  requested?: unknown;
  available?: unknown;
}

function firstStockDetail(
  error: ApiError
): InsufficientStockDetail | undefined {
  if (!Array.isArray(error.details) || error.details.length === 0) {
    return undefined;
  }

  const detail = error.details[0] as InsufficientStockDetail;
  return typeof detail?.productId === 'string' ? detail : undefined;
}

function resolveStockMessage(
  error: ApiError,
  ctx?: ProformaErrorContext
): string {
  const detail = firstStockDetail(error);

  if (!detail) {
    return 'No hay stock suficiente para completar la venta.';
  }

  const product = ctx?.products?.find((p) => p.id === detail.productId);
  const name = product
    ? `${product.code} ${product.name}`
    : (detail.productId as string);

  const requested = detail.requested;
  const available = detail.available;

  if (typeof requested === 'number' && typeof available === 'number') {
    return `No hay stock suficiente de ${name}. Disponibles: ${available}, solicitadas: ${requested}.`;
  }

  return `No hay stock suficiente de ${name} para completar la venta.`;
}

export function getProformaErrorMessage(
  error: unknown,
  ctx?: ProformaErrorContext
): string {
  if (error instanceof ApiError) {
    if (error.errorCode === 'INSUFFICIENT_STOCK') {
      return resolveStockMessage(error, ctx);
    }

    if (error.errorCode && PROFORMA_ERROR_MESSAGES[error.errorCode]) {
      return PROFORMA_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return 'Revisá los datos ingresados.';
    }
  }

  return UNKNOWN_FALLBACK;
}

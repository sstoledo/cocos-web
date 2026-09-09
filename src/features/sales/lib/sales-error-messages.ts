import type { Product } from '@/features/products/types';
import { ApiError } from '@/lib/api-error';

const SALE_ERROR_MESSAGES: Record<string, string> = {
  SALE_EMPTY_LINES: 'Agregá al menos un producto o servicio.',
  CLIENT_NOT_FOUND: 'El cliente seleccionado no existe o está inactivo.',
  PRODUCT_NOT_FOUND: 'Uno de los productos no existe o está inactivo.',
  SERVICE_NOT_FOUND: 'Uno de los servicios no existe o está inactivo.',
  BRANCH_NOT_FOUND: 'La sucursal seleccionada no existe o está inactiva.',
  EMPLOYEE_NOT_FOUND: 'El empleado seleccionado no existe o está inactivo.',
  SALE_NOT_FOUND: 'La venta no existe o fue eliminada.',
  // Backend guard (B8); the zod schema blocks this client-side first (D8).
  SALE_DUPLICATE_LINE: 'No podés cargar el mismo producto dos veces.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo registrar la venta. Intentá de nuevo más tarde.';
const STOCK_FALLBACK = 'No hay stock suficiente para completar la venta.';

export interface SalesErrorContext {
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

function resolveStockMessage(error: ApiError, ctx?: SalesErrorContext): string {
  const detail = firstStockDetail(error);

  if (!detail) {
    return STOCK_FALLBACK;
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

export function getSalesErrorMessage(
  error: unknown,
  ctx?: SalesErrorContext
): string {
  if (error instanceof ApiError) {
    if (error.errorCode === 'INSUFFICIENT_STOCK') {
      return resolveStockMessage(error, ctx);
    }

    if (error.errorCode && SALE_ERROR_MESSAGES[error.errorCode]) {
      return SALE_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

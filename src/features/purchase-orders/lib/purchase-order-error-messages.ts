import { ApiError } from '@/lib/api-error';

// Codes transcribed from the B10 backend (purchase-orders.service.ts).
// NOTE: the not-found code is PURCHASE_ORDER_NOT_FOUND, not PO_NOT_FOUND.
const PURCHASE_ORDER_ERROR_MESSAGES: Record<string, string> = {
  PURCHASE_ORDER_NOT_FOUND: 'La orden de compra no existe o fue eliminada.',
  SUPPLIER_NOT_FOUND: 'El proveedor seleccionado no existe o está inactivo.',
  PRODUCT_NOT_FOUND: 'Uno de los productos no existe o está inactivo.',
  PO_EMPTY_LINES: 'Agregá al menos un producto a la orden.',
  PO_DUPLICATE_LINE: 'No podés cargar el mismo producto dos veces.',
  PO_NOT_DRAFT: 'Solo se pueden editar órdenes en borrador.',
  PO_ALREADY_ORDERED: 'Esta orden ya fue confirmada.',
  PO_CANNOT_CANCEL: 'Esta orden no se puede cancelar.',
  PO_NOT_RECEIVABLE: 'Esta orden no está en condiciones de recibir mercadería.',
  PO_LINE_NOT_FOUND: 'Una de las líneas no pertenece a esta orden.',
  PO_RECEIVE_OVERSHOOT:
    'La cantidad recibida supera lo pendiente de alguna línea.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo completar la operación. Intentá de nuevo más tarde.';

export function getPurchaseOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode && PURCHASE_ORDER_ERROR_MESSAGES[error.errorCode]) {
      return PURCHASE_ORDER_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

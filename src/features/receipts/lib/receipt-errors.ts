import { ApiError } from '@/lib/api-error';

const ERROR_MESSAGES: Record<string, string> = {
  RECEIPT_NOT_FOUND: 'El comprobante no existe o fue eliminado.',
  RECEIPT_NOT_PENDING: 'El comprobante ya no está pendiente.',
  RECEIPT_ALREADY_CONFIRMED:
    'Este comprobante ya fue confirmado. Actualizá la página para ver el resultado.',
  RECEIPT_OCR_REQUIRED:
    'Primero se debe completar la extracción OCR del comprobante.',
  OCR_NOT_CONFIGURED:
    'El servicio OCR no está configurado. Contactá al administrador.',
  OCR_EXTRACTION_FAILED:
    'No se pudo extraer la información. Intentá nuevamente más tarde.',
  RECEIPT_FILE_FETCH_FAILED:
    'No se pudo recuperar el archivo para procesarlo. Intentá nuevamente.',
  RECEIPT_FILE_TOO_LARGE: 'El comprobante no puede superar los 10 MB.',
  RECEIPT_FILE_TYPE_UNSUPPORTED:
    'El comprobante debe ser un PDF o una imagen JPEG, PNG o WebP.',
  PURCHASE_ORDER_NOT_FOUND: 'La orden de compra seleccionada no existe.',
  PO_NOT_RECEIVABLE: 'La orden seleccionada ya no admite recepciones.',
  PO_RECEIVE_OVERSHOOT:
    'La cantidad recibida supera lo pendiente de alguna línea.',
};

export function getReceiptErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode && ERROR_MESSAGES[error.errorCode]) {
      return ERROR_MESSAGES[error.errorCode];
    }
    if (error.status === 409) {
      return 'El comprobante cambió de estado. Actualizá e intentá nuevamente.';
    }
    if (error.status === 400) {
      return 'Revisá los datos ingresados antes de confirmar.';
    }
    if (error.status === 413) {
      return ERROR_MESSAGES.RECEIPT_FILE_TOO_LARGE;
    }
    if (error.status === 415) {
      return ERROR_MESSAGES.RECEIPT_FILE_TYPE_UNSUPPORTED;
    }
  }
  if (error instanceof Error && !('status' in error)) {
    return error.message;
  }
  return 'No se pudo completar la operación. Intentá nuevamente más tarde.';
}

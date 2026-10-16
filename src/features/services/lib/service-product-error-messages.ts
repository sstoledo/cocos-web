import { ApiError } from '@/lib/api-error';

const SERVICE_PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'El producto no existe o fue eliminado.',
  SERVICE_PRODUCT_NOT_FOUND: 'El producto no está en la receta del servicio.',
  SERVICE_PRODUCT_ALREADY_EXISTS: 'El producto ya está en la receta.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo actualizar la receta. Intentá de nuevo más tarde.';

export function getServiceProductErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode && SERVICE_PRODUCT_ERROR_MESSAGES[error.errorCode]) {
      return SERVICE_PRODUCT_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 403) {
      return 'No tenés permisos para modificar la receta.';
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

import { ApiError } from '@/lib/api-error';

const WORK_ORDER_ERROR_MESSAGES: Record<string, string> = {
  CLIENT_NOT_FOUND: 'El cliente seleccionado no existe o está inactivo.',
  VEHICLE_NOT_FOUND: 'El vehículo seleccionado no existe o está inactivo.',
  SERVICE_NOT_FOUND: 'Uno de los servicios no existe o está inactivo.',
  PRODUCT_NOT_FOUND: 'Uno de los productos no existe o está inactivo.',
  VEHICLE_CLIENT_MISMATCH: 'El vehículo no pertenece al cliente seleccionado.',
  WORK_ORDER_EMPTY_LINES: 'Agregá al menos un servicio o producto.',
};

const BAD_REQUEST_FALLBACK = 'Revisá los datos ingresados.';
const UNKNOWN_FALLBACK =
  'No se pudo guardar la orden. Intentá de nuevo más tarde.';

export function getWorkOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorCode && WORK_ORDER_ERROR_MESSAGES[error.errorCode]) {
      return WORK_ORDER_ERROR_MESSAGES[error.errorCode];
    }

    if (error.status === 400) {
      return BAD_REQUEST_FALLBACK;
    }
  }

  return UNKNOWN_FALLBACK;
}

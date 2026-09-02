import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getWorkOrderErrorMessage } from './work-order-error-messages';

describe('getWorkOrderErrorMessage', () => {
  it.each([
    ['CLIENT_NOT_FOUND', 'El cliente seleccionado no existe o está inactivo.'],
    [
      'VEHICLE_NOT_FOUND',
      'El vehículo seleccionado no existe o está inactivo.',
    ],
    ['SERVICE_NOT_FOUND', 'Uno de los servicios no existe o está inactivo.'],
    ['PRODUCT_NOT_FOUND', 'Uno de los productos no existe o está inactivo.'],
    [
      'VEHICLE_CLIENT_MISMATCH',
      'El vehículo no pertenece al cliente seleccionado.',
    ],
    ['WORK_ORDER_EMPTY_LINES', 'Agregá al menos un servicio o producto.'],
  ])('maps %s to its Spanish message', (errorCode, expected) => {
    const error = new ApiError('Failed: 404', 404, errorCode);

    expect(getWorkOrderErrorMessage(error)).toBe(expected);
  });

  it('falls back to the 400 message for unknown errorCodes with status 400', () => {
    const error = new ApiError('Failed: 400', 400, 'SOME_VALIDATOR_ERROR');

    expect(getWorkOrderErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the 400 message when no errorCode with status 400', () => {
    const error = new ApiError('Failed: 400', 400);

    expect(getWorkOrderErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the generic message for server errors without errorCode', () => {
    const error = new ApiError('Failed: 500', 500);

    expect(getWorkOrderErrorMessage(error)).toBe(
      'No se pudo guardar la orden. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for non-ApiError errors', () => {
    expect(getWorkOrderErrorMessage(new Error('boom'))).toBe(
      'No se pudo guardar la orden. Intentá de nuevo más tarde.'
    );
  });
});

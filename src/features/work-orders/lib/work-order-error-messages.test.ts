import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { buildWorkOrderProductLine } from '../test/fixtures';
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

  it('maps INVALID_STATUS_TRANSITION to the already-changed message', () => {
    const error = new ApiError('Failed: 409', 409, 'INVALID_STATUS_TRANSITION');

    expect(getWorkOrderErrorMessage(error)).toBe(
      'El estado de la orden ya cambió. Actualizamos los datos.'
    );
  });

  it('maps WORK_ORDER_NOT_FOUND to the not-found message', () => {
    const error = new ApiError('Failed: 404', 404, 'WORK_ORDER_NOT_FOUND');

    expect(getWorkOrderErrorMessage(error)).toBe(
      'La orden no existe o fue eliminada.'
    );
  });

  it('S10: names the product when INSUFFICIENT_STOCK details resolve against the loaded lines', () => {
    const line = buildWorkOrderProductLine({
      productId: 'prod1',
      product: {
        id: 'prod1',
        code: 'PRD-01',
        name: 'Filtro de aceite',
        description: null,
        price: '80.50',
      },
    });
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'prod1', requested: 3, available: 1 },
    ]);

    expect(getWorkOrderErrorMessage(error, { products: [line] })).toBe(
      'No hay stock suficiente de PRD-01 Filtro de aceite para completar la orden.'
    );
  });

  it('S10: falls back to the raw productId when the product is not in the loaded lines', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'prod-xyz', requested: 3, available: 1 },
    ]);

    expect(
      getWorkOrderErrorMessage(error, {
        products: [buildWorkOrderProductLine()],
      })
    ).toBe('No hay stock suficiente de prod-xyz para completar la orden.');
  });

  it('S11: omits the product segment when INSUFFICIENT_STOCK has no details', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK');

    expect(getWorkOrderErrorMessage(error)).toBe(
      'No hay stock suficiente para completar la orden.'
    );
  });

  it('S11: omits the product segment when details are not an array', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', {
      unexpected: true,
    });

    expect(getWorkOrderErrorMessage(error)).toBe(
      'No hay stock suficiente para completar la orden.'
    );
  });

  it('S12: falls back to the generic message for unknown errorCodes', () => {
    const error = new ApiError('Failed: 409', 409, 'SOMETHING_ELSE');

    expect(getWorkOrderErrorMessage(error)).toBe(
      'No se pudo guardar la orden. Intentá de nuevo más tarde.'
    );
  });
});

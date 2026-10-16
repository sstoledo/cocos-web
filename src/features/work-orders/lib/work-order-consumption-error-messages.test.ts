import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getWorkOrderConsumptionErrorMessage } from './work-order-consumption-error-messages';

describe('getWorkOrderConsumptionErrorMessage', () => {
  it('maps INSUFFICIENT_STOCK with requested and available amounts', () => {
    const error = new ApiError('Failed', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'p1', requested: 5, available: 2 },
    ]);

    expect(getWorkOrderConsumptionErrorMessage(error)).toBe(
      'Stock insuficiente: solicitaste 5 y hay 2 disponible(s).'
    );
  });

  it('falls back to a generic stock message without details', () => {
    const error = new ApiError('Failed', 409, 'INSUFFICIENT_STOCK');

    expect(getWorkOrderConsumptionErrorMessage(error)).toBe(
      'No hay stock suficiente de este producto.'
    );
  });

  it('maps NO_OPEN_CONTAINER', () => {
    const error = new ApiError('Failed', 409, 'NO_OPEN_CONTAINER');

    expect(getWorkOrderConsumptionErrorMessage(error)).toBe(
      'No hay ningún envase abierto de este producto.'
    );
  });

  it('maps WORK_ORDER_CLOSED', () => {
    const error = new ApiError('Failed', 409, 'WORK_ORDER_CLOSED');

    expect(getWorkOrderConsumptionErrorMessage(error)).toBe(
      'No se puede registrar consumo en una orden finalizada o cancelada.'
    );
  });

  it('maps CONSUMPTION_TYPE_NOT_ALLOWED and CONSUMPTION_QUANTITY_REQUIRED', () => {
    expect(
      getWorkOrderConsumptionErrorMessage(
        new ApiError('Failed', 400, 'CONSUMPTION_TYPE_NOT_ALLOWED')
      )
    ).toBe('Este producto no admite ese tipo de evento.');
    expect(
      getWorkOrderConsumptionErrorMessage(
        new ApiError('Failed', 400, 'CONSUMPTION_QUANTITY_REQUIRED')
      )
    ).toBe('La cantidad es obligatoria para este tipo de evento.');
  });

  it('maps not-found codes', () => {
    expect(
      getWorkOrderConsumptionErrorMessage(
        new ApiError('Failed', 404, 'WORK_ORDER_NOT_FOUND')
      )
    ).toBe('La orden no existe o fue eliminada.');
    expect(
      getWorkOrderConsumptionErrorMessage(
        new ApiError('Failed', 404, 'PRODUCT_NOT_FOUND')
      )
    ).toBe('El producto no existe o fue eliminado.');
  });

  it('maps 403 to a permission message', () => {
    expect(
      getWorkOrderConsumptionErrorMessage(new ApiError('Failed', 403))
    ).toBe('No tenés permisos para registrar consumo en esta orden.');
  });

  it('falls back for unknown errors', () => {
    expect(getWorkOrderConsumptionErrorMessage(new Error('boom'))).toBe(
      'No se pudo registrar el consumo. Intentá de nuevo más tarde.'
    );
    expect(
      getWorkOrderConsumptionErrorMessage(new ApiError('Failed', 400))
    ).toBe('Revisá los datos ingresados.');
  });
});

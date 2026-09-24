import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getPurchaseOrderErrorMessage } from './purchase-order-error-messages';

describe('getPurchaseOrderErrorMessage', () => {
  it.each([
    [
      'PURCHASE_ORDER_NOT_FOUND',
      'La orden de compra no existe o fue eliminada.',
    ],
    [
      'SUPPLIER_NOT_FOUND',
      'El proveedor seleccionado no existe o está inactivo.',
    ],
    ['PRODUCT_NOT_FOUND', 'Uno de los productos no existe o está inactivo.'],
    ['PO_EMPTY_LINES', 'Agregá al menos un producto a la orden.'],
    ['PO_DUPLICATE_LINE', 'No podés cargar el mismo producto dos veces.'],
    ['PO_NOT_DRAFT', 'Solo se pueden editar órdenes en borrador.'],
    ['PO_ALREADY_ORDERED', 'Esta orden ya fue confirmada.'],
    ['PO_CANNOT_CANCEL', 'Esta orden no se puede cancelar.'],
    [
      'PO_NOT_RECEIVABLE',
      'Esta orden no está en condiciones de recibir mercadería.',
    ],
    ['PO_LINE_NOT_FOUND', 'Una de las líneas no pertenece a esta orden.'],
    [
      'PO_RECEIVE_OVERSHOOT',
      'La cantidad recibida supera lo pendiente de alguna línea.',
    ],
  ])('maps %s to its Spanish message', (errorCode, expected) => {
    const error = new ApiError('Failed: 409', 409, errorCode);

    expect(getPurchaseOrderErrorMessage(error)).toBe(expected);
  });

  it('falls back to the 400 message for unknown errorCodes with status 400', () => {
    const error = new ApiError('Failed: 400', 400, 'SOME_VALIDATOR_ERROR');

    expect(getPurchaseOrderErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the 400 message when no errorCode with status 400', () => {
    const error = new ApiError('Failed: 400', 400);

    expect(getPurchaseOrderErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the generic message for server errors without errorCode', () => {
    const error = new ApiError('Failed: 500', 500);

    expect(getPurchaseOrderErrorMessage(error)).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for unknown errorCodes', () => {
    const error = new ApiError('Failed: 409', 409, 'SOMETHING_ELSE');

    expect(getPurchaseOrderErrorMessage(error)).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for non-ApiError errors', () => {
    expect(getPurchaseOrderErrorMessage(new Error('boom'))).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });
});

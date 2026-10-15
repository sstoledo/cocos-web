import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getWorkOrderPaymentErrorMessage } from './work-order-payment-error-messages';

describe('getWorkOrderPaymentErrorMessage', () => {
  it('maps WORK_ORDER_OVERPAYMENT including the remaining balance', () => {
    const error = new ApiError(
      'Payment exceeds remaining balance 150.00',
      400,
      'WORK_ORDER_OVERPAYMENT'
    );

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'El monto supera el saldo restante de la orden (saldo: 150.00).'
    );
  });

  it('maps WORK_ORDER_OVERPAYMENT without a parseable balance', () => {
    const error = new ApiError('Overpayment', 400, 'WORK_ORDER_OVERPAYMENT');

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'El monto supera el saldo restante de la orden.'
    );
  });

  it('maps WORK_ORDER_NOT_FOUND', () => {
    const error = new ApiError('Not found', 404, 'WORK_ORDER_NOT_FOUND');

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'La orden no existe o fue eliminada.'
    );
  });

  it('maps WORK_ORDER_CANCELLED', () => {
    const error = new ApiError('Cancelled', 409, 'WORK_ORDER_CANCELLED');

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'No se pueden registrar pagos en una orden cancelada.'
    );
  });

  it('maps 403 without error code to a permissions message', () => {
    const error = new ApiError('Forbidden', 403);

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'No tenés permisos para registrar pagos.'
    );
  });

  it('falls back for 400 without a known code', () => {
    const error = new ApiError('Bad request', 400);

    expect(getWorkOrderPaymentErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back for unknown errors', () => {
    expect(getWorkOrderPaymentErrorMessage(new Error('boom'))).toBe(
      'No se pudo registrar el pago. Intentá de nuevo más tarde.'
    );
  });
});

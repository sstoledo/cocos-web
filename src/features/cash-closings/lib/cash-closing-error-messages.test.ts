import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getCashClosingErrorMessage } from './cash-closing-error-messages';

describe('getCashClosingErrorMessage', () => {
  it.each([
    ['CLOSING_CONFLICT', 'Ya existe un cierre para este período.'],
    ['CASH_CLOSING_NOT_FOUND', 'El cierre de caja no existe o fue eliminado.'],
  ])('maps %s to its Spanish message', (errorCode, expected) => {
    const error = new ApiError('Failed: 409', 409, errorCode);

    expect(getCashClosingErrorMessage(error)).toBe(expected);
  });

  it('falls back to the 400 message for unknown errorCodes with status 400', () => {
    const error = new ApiError('Failed: 400', 400, 'SOME_VALIDATOR_ERROR');

    expect(getCashClosingErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the 400 message when no errorCode with status 400', () => {
    const error = new ApiError('Failed: 400', 400);

    expect(getCashClosingErrorMessage(error)).toBe(
      'Revisá los datos ingresados.'
    );
  });

  it('falls back to the generic message for server errors without errorCode', () => {
    const error = new ApiError('Failed: 500', 500);

    expect(getCashClosingErrorMessage(error)).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for unknown errorCodes', () => {
    const error = new ApiError('Failed: 409', 409, 'SOMETHING_ELSE');

    expect(getCashClosingErrorMessage(error)).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for non-ApiError errors', () => {
    expect(getCashClosingErrorMessage(new Error('boom'))).toBe(
      'No se pudo completar la operación. Intentá de nuevo más tarde.'
    );
  });
});

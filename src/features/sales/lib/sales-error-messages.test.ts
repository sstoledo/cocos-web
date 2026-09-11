import type { Product } from '@/features/products/types';
import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getSalesErrorMessage } from './sales-error-messages';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    code: 'PRD-001',
    name: 'Filtro de aceite',
    price: '80.50',
    isActive: true,
    presentation: { id: 'pres1', name: 'Unidad' },
    brand: { id: 'b1', name: 'Bosch' },
    category: { id: 'cat1', name: 'Filtros' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getSalesErrorMessage', () => {
  it.each([
    ['SALE_EMPTY_LINES', 'Agregá al menos un producto o servicio.'],
    ['CLIENT_NOT_FOUND', 'El cliente seleccionado no existe o está inactivo.'],
    ['PRODUCT_NOT_FOUND', 'Uno de los productos no existe o está inactivo.'],
    ['SERVICE_NOT_FOUND', 'Uno de los servicios no existe o está inactivo.'],
    ['BRANCH_NOT_FOUND', 'La sucursal seleccionada no existe o está inactiva.'],
    [
      'EMPLOYEE_NOT_FOUND',
      'El empleado seleccionado no existe o está inactivo.',
    ],
    ['SALE_NOT_FOUND', 'La venta no existe o fue eliminada.'],
    ['SALE_ALREADY_CANCELLED', 'Esta venta ya fue cancelada.'],
  ])('maps %s to its Spanish message', (errorCode, expected) => {
    const error = new ApiError('Failed: 404', 404, errorCode);

    expect(getSalesErrorMessage(error)).toBe(expected);
  });

  it('S14: names the failing product with available and requested units', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'p1', requested: 3, available: 1 },
    ]);

    expect(getSalesErrorMessage(error, { products: [buildProduct()] })).toBe(
      'No hay stock suficiente de PRD-001 Filtro de aceite. Disponibles: 1, solicitadas: 3.'
    );
  });

  it('S14: falls back to the raw productId when the product is not in context', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'prod-xyz', requested: 3, available: 1 },
    ]);

    expect(getSalesErrorMessage(error, { products: [buildProduct()] })).toBe(
      'No hay stock suficiente de prod-xyz. Disponibles: 1, solicitadas: 3.'
    );
  });

  it('S14: omits the units when details lack requested/available numbers', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'p1' },
    ]);

    expect(getSalesErrorMessage(error, { products: [buildProduct()] })).toBe(
      'No hay stock suficiente de PRD-001 Filtro de aceite para completar la venta.'
    );
  });

  it('S14: falls back to the generic stock message when there are no details', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK');

    expect(getSalesErrorMessage(error)).toBe(
      'No hay stock suficiente para completar la venta.'
    );
  });

  it('S14: falls back to the generic stock message when details are not an array', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', {
      unexpected: true,
    });

    expect(getSalesErrorMessage(error)).toBe(
      'No hay stock suficiente para completar la venta.'
    );
  });

  it('S15: maps SALE_DUPLICATE_LINE to the duplicate message', () => {
    const error = new ApiError('Failed: 400', 400, 'SALE_DUPLICATE_LINE');

    expect(getSalesErrorMessage(error)).toBe(
      'No podés cargar el mismo producto dos veces.'
    );
  });

  it('falls back to the 400 message for unknown errorCodes with status 400', () => {
    const error = new ApiError('Failed: 400', 400, 'SOME_VALIDATOR_ERROR');

    expect(getSalesErrorMessage(error)).toBe('Revisá los datos ingresados.');
  });

  it('falls back to the 400 message when no errorCode with status 400', () => {
    const error = new ApiError('Failed: 400', 400);

    expect(getSalesErrorMessage(error)).toBe('Revisá los datos ingresados.');
  });

  it('falls back to the generic message for server errors without errorCode', () => {
    const error = new ApiError('Failed: 500', 500);

    expect(getSalesErrorMessage(error)).toBe(
      'No se pudo registrar la venta. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for unknown errorCodes', () => {
    const error = new ApiError('Failed: 409', 409, 'SOMETHING_ELSE');

    expect(getSalesErrorMessage(error)).toBe(
      'No se pudo registrar la venta. Intentá de nuevo más tarde.'
    );
  });

  it('S5: maps SALE_NOT_FOUND to the not-found message on cancel context', () => {
    const error = new ApiError('Failed: 404', 404, 'SALE_NOT_FOUND');

    expect(getSalesErrorMessage(error, { action: 'cancel' })).toBe(
      'La venta no existe o fue eliminada.'
    );
  });

  it('S4: falls back to the cancel message for unknown errorCodes in cancel context', () => {
    const error = new ApiError('Failed: 409', 409, 'SOMETHING_ELSE');

    expect(getSalesErrorMessage(error, { action: 'cancel' })).toBe(
      'No se pudo cancelar la venta. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the cancel message for non-ApiError errors in cancel context', () => {
    expect(getSalesErrorMessage(new Error('boom'), { action: 'cancel' })).toBe(
      'No se pudo cancelar la venta. Intentá de nuevo más tarde.'
    );
  });

  it('falls back to the generic message for non-ApiError errors', () => {
    expect(getSalesErrorMessage(new Error('boom'))).toBe(
      'No se pudo registrar la venta. Intentá de nuevo más tarde.'
    );
  });
});

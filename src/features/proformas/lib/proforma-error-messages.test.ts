import type { Product } from '@/features/products/types';
import { ApiError } from '@/lib/api-error';
import { describe, expect, it } from 'vitest';
import { getProformaErrorMessage } from './proforma-error-messages';

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

describe('getProformaErrorMessage', () => {
  it.each([
    ['PROFORMA_EMPTY_LINES', 'Agregá al menos un producto.'],
    ['CLIENT_NOT_FOUND', 'El cliente seleccionado no existe o está inactivo.'],
    ['PRODUCT_NOT_FOUND', 'Uno de los productos no existe o está inactivo.'],
    ['BRANCH_NOT_FOUND', 'La sucursal seleccionada no existe o está inactiva.'],
    [
      'EMPLOYEE_NOT_FOUND',
      'El empleado seleccionado no existe o está inactivo.',
    ],
    ['PROFORMA_NOT_FOUND', 'La proforma no existe o fue eliminada.'],
    ['PROFORMA_NOT_DRAFT', 'Solo se pueden editar proformas en borrador.'],
    ['PROFORMA_NOT_ACCEPTED', 'Solo se pueden convertir proformas aceptadas.'],
    ['INVALID_STATUS_TRANSITION', 'No se puede cambiar a ese estado.'],
    ['PROFORMA_DUPLICATE_LINE', 'No podés cargar el mismo producto dos veces.'],
  ])('maps %s to its Spanish message', (errorCode, expected) => {
    const error = new ApiError('Failed: 400', 400, errorCode);

    expect(getProformaErrorMessage(error)).toBe(expected);
  });

  it('names the failing product with available and requested units', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'p1', requested: 3, available: 1 },
    ]);

    expect(getProformaErrorMessage(error, { products: [buildProduct()] })).toBe(
      'No hay stock suficiente de PRD-001 Filtro de aceite. Disponibles: 1, solicitadas: 3.'
    );
  });

  it('falls back to the raw productId when the product is not in context', () => {
    const error = new ApiError('Failed: 409', 409, 'INSUFFICIENT_STOCK', [
      { productId: 'prod-xyz', requested: 3, available: 1 },
    ]);

    expect(getProformaErrorMessage(error, { products: [buildProduct()] })).toBe(
      'No hay stock suficiente de prod-xyz. Disponibles: 1, solicitadas: 3.'
    );
  });

  it('falls back to the generic message for server errors without errorCode', () => {
    const error = new ApiError('Failed: 500', 500);

    expect(getProformaErrorMessage(error)).toBe(
      'No se pudo procesar la proforma. Intentá de nuevo más tarde.'
    );
  });
});

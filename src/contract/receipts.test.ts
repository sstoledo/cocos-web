import { describe, expect, it } from 'vitest';
import type { components, paths } from './api-types';

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : never;

const receiptPaths = [
  '/api/receipts',
  '/api/receipts/{id}',
  '/api/receipts/{id}/confirm-lot',
  '/api/receipts/{id}/confirm-purchase-order',
  '/api/receipts/{id}/ocr',
  '/api/receipts/{id}/discard',
] as const satisfies readonly (keyof paths)[];

type ReceiptStatusQuery = NonNullable<
  paths['/api/receipts']['get']['parameters']['query']
>;
type LegacyProductQuery = NonNullable<
  paths['/api/products']['get']['parameters']['query']
>;

const _receiptStatusQueryMatchesContract: Expect<
  Equal<ReceiptStatusQuery, { status?: 'pending' | 'confirmed' | 'discarded' }>
> = true;

const _lotConfirmationMatchesContract: Expect<
  Equal<
    components['schemas']['ConfirmLotItem'],
    {
      productId: string;
      quantity: number;
      costPrice: number;
      expirationDate: string;
    }
  >
> = true;

const _purchaseOrderConfirmationMatchesContract: Expect<
  Equal<
    components['schemas']['ConfirmPurchaseOrderLine'],
    {
      lineId: string;
      receivedQty: number;
      expirationDate: string;
      actualCostPrice: string;
    }
  >
> = true;

const _legacyProductQueryIsUnchanged: Expect<
  Equal<LegacyProductQuery, { q?: string; isActive?: boolean }>
> = true;

// The existing backend OpenAPI document does not expose /api/lots. Preserve
// that baseline rather than inventing a new lots contract in this feature.
const _legacyLotsContractIsUnchanged: Expect<
  Equal<'/api/lots' extends keyof paths ? true : false, false>
> = true;

const contractAssertions = [
  _receiptStatusQueryMatchesContract,
  _lotConfirmationMatchesContract,
  _purchaseOrderConfirmationMatchesContract,
  _legacyProductQueryIsUnchanged,
  _legacyLotsContractIsUnchanged,
];

describe('receipts OpenAPI contract', () => {
  it('exposes every receipt operation and preserves legacy contracts', () => {
    expect(receiptPaths).toHaveLength(6);
    expect(contractAssertions.every((assertion) => assertion === true)).toBe(
      true
    );
  });
});

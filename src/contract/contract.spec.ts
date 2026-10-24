import { readFileSync } from 'node:fs';
import path from 'node:path';
import { closeCashClosingSchema } from '@/features/cash-closings/schemas/cash-closing-schema';
import { clientSchema } from '@/features/clients/schemas/client-schema';
import {
  convertProformaSchema,
  proformaSchema,
} from '@/features/proformas/schemas/proforma-schema';
import { createWorkOrderPaymentSchema } from '@/features/work-orders/schemas/work-order-payment-schema';
import { workOrderSchema } from '@/features/work-orders/schemas/work-order-schema';
import { describe, expect, it } from 'vitest';
import type { components } from './api-types';

// Type-level equality helper: asserts A and B are structurally identical in
// both directions (the classic conditional-type isomorphism trick).
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : never;

// The contract spiral:
//   OpenAPI YAML (cocos-back, source of truth)
//     -> generated types (src/contract/api-types.ts, committed)
//       -> frontend zod schemas validated against them in this spec.
// The `contract:check` npm script keeps the generated file in sync with the
// YAML at CI time (regenerate + git diff --exit-code).

type Api = components['schemas'];

// S2: the pagination wrapper the backend returns for every paginated list.
// This is asserted against the shape the frontend hooks consume after the
// {page, limit, total} -> {page, total, totalPages} derivation.
const _paginationMatchesBackend: Expect<
  Equal<Api['PaginatedMeta'], { page: number; limit: number; total: number }>
> = true;

// Money travels one way: requests are numbers, responses are decimal strings.
const _servicePriceIsString: Expect<
  Equal<Api['ServiceResponse']['price'], string>
> = true;
const _workOrderTotalIsString: Expect<
  Equal<Api['WorkOrderResponse']['totalAmount'], string>
> = true;
const _workOrderPaidIsString: Expect<
  Equal<Api['WorkOrderResponse']['paidAmount'], string>
> = true;
const _paymentRequestIsNumber: Expect<
  Equal<Api['CreateWorkOrderPayment']['amount'], number>
> = true;
const _paymentResponseIsString: Expect<
  Equal<Api['WorkOrderPaymentResponse']['amount'], string>
> = true;
const _cashClosingDifferenceIsString: Expect<
  Equal<Api['CashClosingResponse']['difference'], string>
> = true;
const _declaredCashIsString: Expect<
  Equal<Api['CreateCashClosing']['declaredCash'], string>
> = true;

// Proformas: money is only read (snapshots/totals are decimal strings);
// requests never carry prices (SL-F4 — the backend owns pricing).
const _proformaTotalIsString: Expect<
  Equal<Api['ProformaResponse']['totalAmount'], string>
> = true;
const _proformaLineSnapshotIsString: Expect<
  Equal<Api['ProformaProductLineResponse']['unitPriceSnapshot'], string>
> = true;
const _proformaLineRequestHasNoPrice: Expect<
  'unitPriceSnapshot' extends keyof Api['CreateProforma'] ? never : true
> = true;
const _convertPaymentMethodParity: Expect<
  Equal<Api['ConvertProforma']['paymentMethod'], 'cash' | 'card' | 'transfer'>
> = true;
// Walk-in proformas: the request carries lines only — the server owns
// numbering, totals and price snapshots.
const _createProformaRequiresProductLines: Expect<
  'productLines' extends keyof Api['CreateProforma'] ? true : never
> = true;
const _createProformaHasNoServerNumber: Expect<
  'proformaNumber' extends keyof Api['CreateProforma'] ? never : true
> = true;
const _proformaStatusParity: Expect<
  Equal<
    Api['ProformaStatus'],
    'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'
  >
> = true;

// Enum parity between generated types and the frontend's own enum literals.
const _workOrderStatusParity: Expect<
  Equal<
    Api['WorkOrderStatus'],
    'pending' | 'in_progress' | 'done' | 'cancelled'
  >
> = true;
const _paymentMethodParity: Expect<
  Equal<Api['PaymentMethod'], 'cash' | 'card' | 'transfer'>
> = true;
const _identificationTypeParity: Expect<
  Equal<Api['CreateClient']['identificationType'], 'DNI' | 'RUC' | undefined>
> = true;

// Work order creation requires the same fields the form enforces.
type ApiCreateWorkOrder = Api['CreateWorkOrder'];
const _createWorkOrderRequiresClientAndVehicle: Expect<
  'clientId' | 'vehicleId' | 'services' extends keyof ApiCreateWorkOrder
    ? true
    : never
> = true;

const _createWorkOrderHasNoServerBankId: Expect<
  'orderNumber' extends keyof ApiCreateWorkOrder ? never : true
> = true;

// Runtime clamp so the type-level assertions above stay referenced (they
// exist to make `tsc` fail when the contract drifts).
const contractAssertions = [
  _paginationMatchesBackend,
  _servicePriceIsString,
  _workOrderTotalIsString,
  _workOrderPaidIsString,
  _paymentRequestIsNumber,
  _paymentResponseIsString,
  _cashClosingDifferenceIsString,
  _declaredCashIsString,
  _workOrderStatusParity,
  _paymentMethodParity,
  _identificationTypeParity,
  _createWorkOrderRequiresClientAndVehicle,
  _createWorkOrderHasNoServerBankId,
  _proformaTotalIsString,
  _proformaLineSnapshotIsString,
  _proformaLineRequestHasNoPrice,
  _convertPaymentMethodParity,
  _createProformaRequiresProductLines,
  _createProformaHasNoServerNumber,
  _proformaStatusParity,
];

describe('openapi contract vs frontend zod schemas', () => {
  it('type-level contract assertions all hold', () => {
    expect(contractAssertions.every((it) => it === true)).toBe(true);
  });
  it('declared cash matches the OpenAPI pattern exactly', () => {
    expect(() =>
      closeCashClosingSchema.parse({ declaredCash: '150.00' })
    ).not.toThrow();
    expect(() =>
      closeCashClosingSchema.parse({ declaredCash: '150' })
    ).not.toThrow();
    expect(() =>
      closeCashClosingSchema.parse({ declaredCash: '150.000' })
    ).toThrow();
    expect(() =>
      closeCashClosingSchema.parse({ declaredCash: '-5.00' })
    ).toThrow();
  });

  it('work order payment accepts the API payment methods and decimal strings the contract documents', () => {
    const schema = createWorkOrderPaymentSchema('150.00');
    const parsed = schema.parse({
      amount: '40.00',
      paymentMethod: 'cash',
    });
    expect(parsed.note).toBeUndefined();
    // The API layer converts the string to a number before posting, exactly
    // what the contract models as a request `number`.
    expect(Number(parsed.amount)).toBe(40);
    expect(() =>
      schema.parse({ amount: '40.00', paymentMethod: 'bitcoin' as 'cash' })
    ).toThrow();
    expect(() =>
      schema.parse({ amount: '40.005', paymentMethod: 'cash' })
    ).toThrow();
  });

  it('client schema output fits inside the OpenAPI CreateClient properties', () => {
    const parsed = clientSchema.parse({
      name: 'Carlos Mendoza',
      identificationType: 'DNI',
      identification: '12345678',
      email: 'carlos@example.com',
    });
    // Required by the contract: name; the identification pair must ride along.
    expect(parsed.name).toBe('Carlos Mendoza');
    expect(['DNI', 'RUC']).toContain(parsed.identificationType);
    // The contract documents DNI as exactly 8 digits: the form enforces it.
    expect(parsed.identification).toMatch(/^\d{8}$/);
  });

  it('work order form values are contract-valid CreateWorkOrder input', () => {
    const parsed = workOrderSchema.parse({
      clientId: 'cl1',
      vehicleId: 'veh1',
      employeeId: 'emp1',
      services: [{ serviceId: 'srv1', quantity: '2', unitPrice: '150.00' }],
    });
    // Form uses strings for numeric fields; the API layer coerces them into
    // the contract's `integer`/`number` request types.
    expect(Number.isInteger(Number(parsed.services[0].quantity))).toBe(true);
    expect(Number(parsed.services[0].unitPrice)).toBe(150);
  });

  it('proforma form values are contract-valid CreateProforma input', () => {
    // Walk-in proformas are valid without clientId (S2).
    const walkIn = proformaSchema.safeParse({
      productLines: [{ productId: 'p1', quantity: 2 }],
    });
    expect(walkIn.success).toBe(true);
    const lined = proformaSchema.parse({
      clientId: 'cl1',
      productLines: [{ productId: 'p1', quantity: 2 }],
    });
    // Lines carry id + quantity only: the backend owns pricing (SL-F4).
    expect(Number.isInteger(Number(lined.productLines[0].quantity))).toBe(true);
    expect(convertProformaSchema.parse({ paymentMethod: 'cash' })).toEqual({
      paymentMethod: 'cash',
    });
    expect(
      convertProformaSchema.safeParse({ paymentMethod: 'bitcoin' as 'cash' })
    ).toMatchObject({ success: false });
  });

  it('generated types carry the documented schemas', () => {
    // Guards against a stale/emptied generated file silently passing.
    const generated = readFileSync(
      path.join(__dirname, 'api-types.ts'),
      'utf8'
    );
    for (const name of [
      'ClientResponse',
      'VehicleResponse',
      'ServiceResponse',
      'WorkOrderResponse',
      'WorkOrderPaymentResponse',
      'SaleResponse',
      'CashClosingResponse',
      'ClosingPreviewResponse',
      'PaginatedMeta',
      'BusinessErrorResponse',
      'ProformaStatus',
      'CreateProforma',
      'UpdateProformaStatus',
      'ConvertProforma',
      'ProformaProductLineResponse',
      'ProformaResponse',
    ]) {
      expect(
        generated.includes(`${name}:`),
        `${name} missing from generated types`
      ).toBe(true);
    }
  });
});

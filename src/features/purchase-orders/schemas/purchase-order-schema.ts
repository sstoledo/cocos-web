import { z } from 'zod';

// Money travels as a string with at most 2 decimals (B10 contract);
// the regex already rejects negatives and non-numeric input.
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

const moneyStringSchema = z
  .string()
  .min(1, 'El precio de costo es requerido')
  .regex(MONEY_PATTERN, 'Ingresá un monto válido (hasta 2 decimales)');

const quantitySchema = z.coerce
  .number()
  .int('La cantidad debe ser un entero')
  .min(1, 'Mínimo 1');

const purchaseOrderLineSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  quantityOrdered: quantitySchema,
  estimatedCostPrice: moneyStringSchema,
});

export const purchaseOrderSchema = z
  .object({
    supplierId: z.string().min(1, 'Seleccioná un proveedor'),
    notes: z.string().optional(),
    lines: z
      .array(purchaseOrderLineSchema)
      .min(1, 'Agregá al menos un producto a la orden'),
  })
  .refine(
    (data) =>
      new Set(data.lines.map((line) => line.productId)).size ===
      data.lines.length,
    {
      message: 'No podés cargar el mismo producto dos veces.',
      path: ['lines'],
    }
  );

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const receiveLineSchema = z.object({
  lineId: z.string().min(1, 'La línea es requerida'),
  receivedQty: quantitySchema,
  expirationDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  actualCostPrice: moneyStringSchema,
});

export const receivePurchaseOrderSchema = z.object({
  lines: z
    .array(receiveLineSchema)
    .min(1, 'Agregá al menos una línea a recibir'),
});

export type ReceivePurchaseOrderFormValues = z.infer<
  typeof receivePurchaseOrderSchema
>;

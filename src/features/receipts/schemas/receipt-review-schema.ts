import { z } from 'zod';

export const RECEIPT_MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

const reviewItemSchema = z.object({
  description: z.string(),
  productId: z.string(),
  lineId: z.string(),
  quantity: z.coerce
    .number()
    .int('La cantidad debe ser un entero')
    .min(1, 'La cantidad debe ser al menos 1'),
  costPrice: z
    .string()
    .min(1, 'El precio de costo es requerido')
    .regex(
      RECEIPT_MONEY_PATTERN,
      'Ingresá un monto válido (hasta 2 decimales)'
    ),
  expirationDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
});

export const receiptReviewSchema = z
  .object({
    destination: z.enum(['lot', 'purchase-order']),
    supplierId: z.string(),
    lotNumber: z.string().max(50, 'Máximo 50 caracteres'),
    notes: z.string().max(500, 'Máximo 500 caracteres'),
    purchaseOrderId: z.string(),
    items: z.array(reviewItemSchema).min(1),
  })
  .superRefine((values, ctx) => {
    if (values.destination === 'lot' && !values.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Seleccioná un proveedor',
        path: ['supplierId'],
      });
    }
    if (values.destination === 'purchase-order' && !values.purchaseOrderId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Seleccioná una orden de compra',
        path: ['purchaseOrderId'],
      });
    }
    values.items.forEach((item, index) => {
      if (values.destination === 'lot') {
        if (!item.productId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Seleccioná un producto',
            path: ['items', index, 'productId'],
          });
        }
        if (Number(item.costPrice) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El precio de costo debe ser mayor a 0',
            path: ['items', index, 'costPrice'],
          });
        }
      } else if (!item.lineId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Seleccioná una línea de la orden',
          path: ['items', index, 'lineId'],
        });
      }
    });
  });

export type ReceiptReviewFormValues = z.infer<typeof receiptReviewSchema>;

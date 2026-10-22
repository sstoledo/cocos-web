import { z } from 'zod';

// Proforma lines carry id + quantity only: the backend owns pricing and
// snapshots the catalog unit price server-side (SAL-F4 / SL-F4).
const lineQuantitySchema = z.coerce
  .number()
  .int('La cantidad debe ser un entero')
  .min(1, 'Mínimo 1');

const productLineSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  quantity: lineQuantitySchema,
});

export const proformaSchema = z
  .object({
    // '' = walk-in proforma; the payload omits clientId (SL-F5).
    clientId: z.string().optional(),
    branchId: z.string().optional(),
    employeeId: z.string().optional(),
    notes: z.string().max(500).optional(),
    productLines: z.array(productLineSchema).default([]),
  })
  .refine((data) => data.productLines.length >= 1, {
    message: 'Agregá al menos un producto',
    path: ['productLines'],
  })
  .refine(
    (data) =>
      new Set(data.productLines.map((line) => line.productId)).size ===
      data.productLines.length,
    {
      message: 'No podés cargar el mismo producto dos veces.',
      path: ['productLines'],
    }
  );

export const convertProformaSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'transfer'], {
    message: 'Seleccioná un método de pago',
  }),
});

export type ProformaFormValues = z.infer<typeof proformaSchema>;
export type ConvertProformaFormValues = z.infer<typeof convertProformaSchema>;

import { z } from 'zod';

// Checkout lines carry id + quantity only: the backend owns pricing and
// snapshots the catalog unit price server-side (SAL-F4 / SL-F4).
const lineQuantitySchema = z.coerce
  .number()
  .int('La cantidad debe ser un entero')
  .min(1, 'Mínimo 1');

const productLineSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  quantity: lineQuantitySchema,
});

const serviceLineSchema = z.object({
  serviceId: z.string().min(1, 'Seleccioná un servicio'),
  quantity: lineQuantitySchema,
});

export const saleSchema = z
  .object({
    // '' = walk-in sale; the payload omits clientId (SL-F5).
    clientId: z.string().optional(),
    paymentMethod: z.enum(['cash', 'card', 'transfer'], {
      message: 'Seleccioná un método de pago',
    }),
    productLines: z.array(productLineSchema).default([]),
    serviceLines: z.array(serviceLineSchema).default([]),
  })
  .refine((data) => data.productLines.length + data.serviceLines.length >= 1, {
    message: 'Agregá al menos un producto o servicio',
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
  )
  .refine(
    (data) =>
      new Set(data.serviceLines.map((line) => line.serviceId)).size ===
      data.serviceLines.length,
    {
      message: 'No podés cargar el mismo servicio dos veces.',
      path: ['serviceLines'],
    }
  );

export type SaleFormValues = z.infer<typeof saleSchema>;

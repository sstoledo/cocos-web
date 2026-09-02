import { z } from 'zod';

const lineQuantitySchema = z.coerce
  .number()
  .int('La cantidad debe ser un entero')
  .min(1, 'Mínimo 1');

const lineUnitPriceSchema = z.preprocess(
  (value) => (value === '' || value == null ? undefined : value),
  z.coerce
    .number()
    .positive('El precio debe ser positivo')
    .refine((n) => Math.round(n * 100) === n * 100, 'Máximo 2 decimales')
    .optional()
);

const serviceLineSchema = z.object({
  serviceId: z.string().min(1, 'Seleccioná un ítem'),
  quantity: lineQuantitySchema,
  unitPrice: lineUnitPriceSchema,
});

const productLineSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un ítem'),
  quantity: lineQuantitySchema,
  unitPrice: lineUnitPriceSchema,
});

export const workOrderSchema = z
  .object({
    clientId: z.string().min(1, 'Seleccioná un cliente'),
    vehicleId: z.string().min(1, 'Seleccioná un vehículo'),
    description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
    services: z.array(serviceLineSchema).default([]),
    products: z.array(productLineSchema).default([]),
  })
  .refine((data) => data.services.length + data.products.length >= 1, {
    message: 'Agregá al menos un servicio o producto',
    path: ['services'],
  });

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

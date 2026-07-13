import { z } from 'zod';

export const lotItemSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.coerce
    .number({ invalid_type_error: 'La cantidad debe ser un número' })
    .min(1, 'La cantidad debe ser al menos 1'),
  costPrice: z.coerce
    .number({ invalid_type_error: 'El precio de costo debe ser un número' })
    .positive('El precio de costo debe ser mayor a 0'),
  expirationDate: z
    .string({
      invalid_type_error: 'La fecha de vencimiento es requerida',
    })
    .min(1, 'La fecha de vencimiento es requerida')
    .pipe(z.coerce.date()),
});

export const lotSchema = z.object({
  lotNumber: z.string().min(1, 'El número de lote es requerido'),
  supplierId: z.string().min(1, 'El proveedor es requerido'),
  receivedAt: z
    .string({
      invalid_type_error: 'La fecha de recepción es requerida',
    })
    .min(1, 'La fecha de recepción es requerida')
    .pipe(z.coerce.date()),
  notes: z.string().optional(),
  items: z.array(lotItemSchema).min(1, 'El lote debe tener al menos un ítem'),
});

export type LotFormValues = z.infer<typeof lotSchema>;

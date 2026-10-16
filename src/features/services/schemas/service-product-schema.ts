import { z } from 'zod';

export const serviceProductSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  quantity: z.coerce
    .number({ invalid_type_error: 'La cantidad debe ser un número' })
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),
});

export type ServiceProductFormValues = z.infer<typeof serviceProductSchema>;

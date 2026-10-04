import { z } from 'zod';

export const serviceSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede superar 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede superar 200 caracteres'),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .positive('El precio debe ser mayor a 0'),
  estimatedDuration: z.coerce
    .number({ invalid_type_error: 'La duración estimada debe ser un número' })
    .int('La duración estimada debe ser un número entero')
    .positive('La duración estimada debe ser mayor a 0')
    .optional(),
  isActive: z.boolean().default(true),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

import { z } from 'zod';

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  phone: z
    .string()
    .max(50, 'El teléfono no puede tener más de 50 caracteres')
    .optional()
    .or(z.literal('')),
  email: z
    .preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .email('El email no es válido')
        .max(100, 'El email no puede tener más de 100 caracteres')
        .optional()
    )
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

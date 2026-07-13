import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .positive('El precio debe ser mayor a 0'),
  presentationId: z.string().min(1, 'La presentación es requerida'),
  brandId: z.string().min(1, 'La marca es requerida'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  barcode: z.string().optional(),
  taxRate: z.coerce
    .number({ invalid_type_error: 'La tasa de impuesto debe ser un número' })
    .min(0, 'La tasa de impuesto no puede ser negativa')
    .optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;

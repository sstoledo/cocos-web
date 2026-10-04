import { z } from 'zod';

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  parentId: z.string().optional().nullable(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

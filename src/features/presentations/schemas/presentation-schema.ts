import { z } from 'zod';

export const presentationSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

export type PresentationFormValues = z.infer<typeof presentationSchema>;

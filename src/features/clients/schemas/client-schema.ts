import { z } from 'zod';

import { isValidRuc } from '@/lib/ruc';

export const clientSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre no puede tener más de 100 caracteres'),
    identificationType: z.enum(['DNI', 'RUC']),
    identification: z.string().min(1, 'La identificación es requerida'),
    phone: z.string().optional(),
    email: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().email('El email no es válido').optional()
    ),
    address: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.identificationType === 'DNI') {
        return /^\d{8}$/.test(data.identification);
      }
      return isValidRuc(data.identification);
    },
    {
      message: 'DNI 8 dígitos o RUC 11 dígitos con dígito verificador válido',
      path: ['identification'],
    }
  );

export type ClientFormValues = z.infer<typeof clientSchema>;

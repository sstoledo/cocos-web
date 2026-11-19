import { z } from 'zod';

import { isValidRuc } from '@/lib/ruc';

export const companySettingsSchema = z.object({
  ruc: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidRuc(value), {
      message: 'El RUC debe tener 11 dígitos con dígito verificador válido',
    }),
  legalName: z
    .string()
    .trim()
    .min(1, 'La razón social es requerida')
    .max(200, 'La razón social no puede tener más de 200 caracteres'),
  address: z
    .string()
    .trim()
    .max(200, 'La dirección no puede tener más de 200 caracteres'),
  ubigeo: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{6}$/.test(value), {
      message: 'El ubigeo debe tener 6 dígitos',
    }),
  facturaSeries: z
    .string()
    .trim()
    .min(1, 'La serie de facturas es requerida')
    .max(10, 'La serie de facturas no puede tener más de 10 caracteres'),
  boletaSeries: z
    .string()
    .trim()
    .min(1, 'La serie de boletas es requerida')
    .max(10, 'La serie de boletas no puede tener más de 10 caracteres'),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

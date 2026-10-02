import { z } from 'zod';

// declaredCash travels as a string with at most 2 decimals (B13 contract);
// the regex already rejects negatives and non-numeric input.
const DECLARED_CASH_PATTERN = /^\d+(\.\d{1,2})?$/;

export const closeCashClosingSchema = z.object({
  declaredCash: z
    .string()
    .min(1, 'El efectivo declarado es requerido')
    .regex(
      DECLARED_CASH_PATTERN,
      'Ingresá un monto válido (hasta 2 decimales)'
    ),
  notes: z.string().optional(),
});

export type CloseCashClosingFormValues = z.infer<typeof closeCashClosingSchema>;

import { toCents } from '@/lib/cents';
import { z } from 'zod';

// Amount travels as a decimal string in the form (2 decimals max, no
// negatives); the API layer converts it to a number for the backend.
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function createWorkOrderPaymentSchema(remainingAmount: string) {
  return z.object({
    amount: z
      .string()
      .min(1, 'El monto es requerido')
      .regex(AMOUNT_PATTERN, 'Ingresá un monto válido (hasta 2 decimales)')
      // Refinements run even when the regex check failed, so re-guard the
      // format before converting to cents.
      .refine((value) => !AMOUNT_PATTERN.test(value) || toCents(value) > 0, {
        message: 'El monto debe ser mayor a cero',
      })
      .refine(
        (value) =>
          !AMOUNT_PATTERN.test(value) ||
          toCents(value) <= toCents(remainingAmount),
        {
          message: `El monto no puede superar el saldo restante (${remainingAmount})`,
        }
      ),
    paymentMethod: z.enum(['cash', 'card', 'transfer'], {
      message: 'Seleccioná un método de pago',
    }),
    note: z.string().optional(),
  });
}

export type WorkOrderPaymentFormValues = z.infer<
  ReturnType<typeof createWorkOrderPaymentSchema>
>;

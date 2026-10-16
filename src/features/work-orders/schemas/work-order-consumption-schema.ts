import { z } from 'zod';

// Quantity travels as a string in the form and is only required (and sent)
// for 'used' events; the API layer converts it to a number.
export const workOrderConsumptionSchema = z
  .object({
    productId: z.string().min(1, 'Seleccioná un producto'),
    type: z.enum(['used', 'opened', 'depleted'], {
      message: 'Seleccioná un tipo de evento',
    }),
    quantity: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== 'used') {
      return;
    }
    const quantity = Number(values.quantity);
    if (!values.quantity || !Number.isInteger(quantity) || quantity <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Ingresá una cantidad válida (entero mayor a 0)',
      });
    }
  });

export type WorkOrderConsumptionFormValues = z.infer<
  typeof workOrderConsumptionSchema
>;

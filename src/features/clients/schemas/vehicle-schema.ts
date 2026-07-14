import { z } from 'zod';

const peruvianPlateRegexes = [
  /^[A-Z]{3}[0-9]{3}$/,
  /^[A-Z][0-9][A-Z][0-9]{3}$/,
  /^[A-Z]{2}[0-9]{4}$/,
  /^E[A-Z]{2}[0-9]{3}$/,
];

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[-\s]/g, '');
}

export const vehicleSchema = z.object({
  plate: z
    .string()
    .min(1, 'La placa es requerida')
    .transform(normalizePlate)
    .refine(
      (value) => peruvianPlateRegexes.some((regex) => regex.test(value)),
      'Placa peruana no válida'
    ),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().min(1900, 'Año no válido').optional()
  ),
  color: z.string().optional(),
  notes: z.string().optional(),
  clientId: z.string().min(1, 'El cliente es requerido'),
});

export type VehicleSchemaValues = z.infer<typeof vehicleSchema>;

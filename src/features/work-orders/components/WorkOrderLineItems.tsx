import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { Service } from '@/features/services/types';
import { formatCents, toCents } from '@/lib/cents';
import {
  type Control,
  type FieldError,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form';
import type { WorkOrderFormValues } from '../schemas/work-order-schema';

type LineEntity = { id: string; name: string; price: string };

type LineValues = {
  quantity: number;
  unitPrice?: number;
};

type LineErrors = {
  serviceId?: FieldError;
  quantity?: FieldError;
  unitPrice?: FieldError;
};

// Integer-cents line subtotal. Falls back to the entity price when the
// override field is empty; returns null for incomplete/invalid lines.
export function lineSubtotalCents(
  line: LineValues,
  entityPrice?: string
): number | null {
  const quantity = Number(line.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return null;
  }

  const raw = line.unitPrice;
  const price =
    raw === undefined || raw === null || String(raw).trim() === ''
      ? entityPrice
      : String(raw);

  if (!price) {
    return null;
  }

  try {
    return toCents(price) * quantity;
  } catch {
    return null;
  }
}

type ServiceLinesFieldArrayProps = {
  services?: Service[];
  control: Control<WorkOrderFormValues>;
  register: UseFormRegister<WorkOrderFormValues>;
  setValue: UseFormSetValue<WorkOrderFormValues>;
};

export function ServiceLinesFieldArray({
  services = [],
  control,
  register,
  setValue,
}: ServiceLinesFieldArrayProps) {
  const entities: LineEntity[] = services;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });
  const lines = useWatch({ control, name: 'services' });
  const { errors } = useFormState({ control });
  const arrayErrors = errors.services;

  const options = entities.map((entity) => ({
    value: entity.id,
    label: entity.name,
  }));

  function entityPrice(id: string) {
    return entities.find((entity) => entity.id === id)?.price;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Servicio</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ serviceId: '', quantity: 1 })}
        >
          Agregar servicio
        </Button>
      </div>

      {fields.map((field, index) => {
        const itemErrors = arrayErrors?.[index] as LineErrors | undefined;
        const line = lines?.[index];
        const subtotal = line
          ? lineSubtotalCents(line, entityPrice(line.serviceId))
          : null;

        return (
          <div
            key={field.id}
            className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <Label htmlFor={`services-${index}-serviceId`}>Servicio</Label>
              <Select
                id={`services-${index}-serviceId`}
                options={options}
                placeholder="Seleccionar servicio"
                error={itemErrors?.serviceId?.message}
                {...register(`services.${index}.serviceId`, {
                  onChange: (event) => {
                    const price = entityPrice(event.target.value);
                    if (price !== undefined) {
                      setValue(
                        `services.${index}.unitPrice`,
                        price as unknown as number
                      );
                    }
                  },
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`services-${index}-quantity`}>Cantidad</Label>
              <Input
                id={`services-${index}-quantity`}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                aria-invalid={itemErrors?.quantity ? 'true' : 'false'}
                {...register(`services.${index}.quantity`)}
              />
              {itemErrors?.quantity && (
                <p className="text-sm text-destructive" role="alert">
                  {itemErrors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`services-${index}-unitPrice`}>
                Precio unitario
              </Label>
              <Input
                id={`services-${index}-unitPrice`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                aria-invalid={itemErrors?.unitPrice ? 'true' : 'false'}
                {...register(`services.${index}.unitPrice`)}
              />
              {itemErrors?.unitPrice && (
                <p className="text-sm text-destructive" role="alert">
                  {itemErrors.unitPrice.message}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Subtotal: {subtotal === null ? '—' : formatCents(subtotal)}
              </p>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="w-full"
              >
                Eliminar
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

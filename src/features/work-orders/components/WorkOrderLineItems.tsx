import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  ServiceCombobox,
  type ServiceComboboxValue,
} from '@/features/services/components/ServiceCombobox';
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

type LineValues = {
  serviceId: string;
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

type ServiceLineRowProps = {
  index: number;
  line: LineValues | undefined;
  errors: LineErrors | undefined;
  register: UseFormRegister<WorkOrderFormValues>;
  resolveService: (id: string) => ServiceComboboxValue | undefined;
  onServiceChange: (index: number, service: Service | null) => void;
  onRemove: (index: number) => void;
};

function ServiceLineRow({
  index,
  line,
  errors: itemErrors,
  register,
  resolveService,
  onServiceChange,
  onRemove,
}: ServiceLineRowProps) {
  const entity = line?.serviceId ? resolveService(line.serviceId) : undefined;
  const subtotal = line ? lineSubtotalCents(line, entity?.price) : null;

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor={`services-${index}-serviceId`}>Servicio</Label>
        <ServiceCombobox
          id={`services-${index}-serviceId`}
          value={entity ?? null}
          onChange={(service) => onServiceChange(index, service)}
          error={itemErrors?.serviceId?.message}
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
        <Label htmlFor={`services-${index}-unitPrice`}>Precio unitario</Label>
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
          onClick={() => onRemove(index)}
          className="w-full"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

type ServiceLinesFieldArrayProps = {
  control: Control<WorkOrderFormValues>;
  register: UseFormRegister<WorkOrderFormValues>;
  setValue: UseFormSetValue<WorkOrderFormValues>;
  // Selected services by id: labels and prices survive across searches.
  resolveService: (id: string) => ServiceComboboxValue | undefined;
  onServiceChange: (index: number, service: Service | null) => void;
};

export function ServiceLinesFieldArray({
  control,
  register,
  setValue,
  resolveService,
  onServiceChange,
}: ServiceLinesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });
  const lines = useWatch({ control, name: 'services' });
  const { errors } = useFormState({ control });
  const arrayErrors = errors.services;

  function handleServiceChange(index: number, service: Service | null) {
    setValue(`services.${index}.serviceId`, service?.id ?? '', {
      shouldValidate: true,
    });
    if (service?.price !== undefined) {
      setValue(
        `services.${index}.unitPrice`,
        service.price as unknown as number
      );
    }
    onServiceChange(index, service);
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

      {fields.map((field, index) => (
        <ServiceLineRow
          key={field.id}
          index={index}
          line={lines?.[index]}
          errors={arrayErrors?.[index] as LineErrors | undefined}
          register={register}
          resolveService={resolveService}
          onServiceChange={handleServiceChange}
          onRemove={remove}
        />
      ))}
    </div>
  );
}

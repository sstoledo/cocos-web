import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { Product } from '@/features/products/types';
import type { Service } from '@/features/services/types';
import {
  type Control,
  type FieldError,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { formatCents, toCents } from '../lib/cents';
import type { WorkOrderFormValues } from '../schemas/work-order-schema';

type LineEntity = { id: string; name: string; price: string };

type LineValues = {
  quantity: number;
  unitPrice?: number;
};

type LineErrors = {
  quantity?: FieldError;
  unitPrice?: FieldError;
} & Record<string, FieldError | undefined>;

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

type LinesFieldArrayProps = {
  name: 'services' | 'products';
  idKey: 'serviceId' | 'productId';
  entities: LineEntity[];
  addLabel: string;
  itemLabel: string;
  control: Control<WorkOrderFormValues>;
  register: UseFormRegister<WorkOrderFormValues>;
  setValue: UseFormSetValue<WorkOrderFormValues>;
};

function LinesFieldArray({
  name,
  idKey,
  entities,
  addLabel,
  itemLabel,
  control,
  register,
  setValue,
}: LinesFieldArrayProps) {
  // `name` is a union of the two line-array keys; casts below pin the RHF
  // generics to one side while the runtime value stays correct.
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as 'services',
  });
  const lines = useWatch({ control, name }) as unknown as
    | Array<LineValues & Record<string, string>>
    | undefined;
  const { errors } = useFormState({ control });
  const arrayErrors = errors[name];

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
        <Label>{itemLabel}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ [idKey]: '', quantity: 1 } as {
              serviceId: string;
              quantity: number;
            })
          }
        >
          {addLabel}
        </Button>
      </div>

      {fields.map((field, index) => {
        const itemErrors = arrayErrors?.[index] as LineErrors | undefined;
        const line = lines?.[index];
        const subtotal = line
          ? lineSubtotalCents(line, entityPrice(line[idKey]))
          : null;

        return (
          <div
            key={field.id}
            className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <Label htmlFor={`${name}-${index}-${idKey}`}>{itemLabel}</Label>
              <Select
                id={`${name}-${index}-${idKey}`}
                options={options}
                placeholder={`Seleccionar ${itemLabel.toLowerCase()}`}
                error={itemErrors?.[idKey]?.message}
                {...register(
                  `${name}.${index}.${idKey}` as `services.${number}.serviceId`,
                  {
                    onChange: (event) => {
                      const price = entityPrice(event.target.value);
                      if (price !== undefined) {
                        setValue(
                          `${name}.${index}.unitPrice` as `services.${number}.unitPrice`,
                          price as unknown as number
                        );
                      }
                    },
                  }
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${name}-${index}-quantity`}>Cantidad</Label>
              <Input
                id={`${name}-${index}-quantity`}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                aria-invalid={itemErrors?.quantity ? 'true' : 'false'}
                {...register(
                  `${name}.${index}.quantity` as `services.${number}.quantity`
                )}
              />
              {itemErrors?.quantity && (
                <p className="text-sm text-destructive" role="alert">
                  {itemErrors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${name}-${index}-unitPrice`}>
                Precio unitario
              </Label>
              <Input
                id={`${name}-${index}-unitPrice`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                aria-invalid={itemErrors?.unitPrice ? 'true' : 'false'}
                {...register(
                  `${name}.${index}.unitPrice` as `services.${number}.unitPrice`
                )}
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

type FieldArrayProps = Pick<
  LinesFieldArrayProps,
  'control' | 'register' | 'setValue'
> & {
  services?: Service[];
  products?: Product[];
};

export function ServiceLinesFieldArray({
  services = [],
  ...props
}: FieldArrayProps) {
  return (
    <LinesFieldArray
      name="services"
      idKey="serviceId"
      entities={services}
      addLabel="Agregar servicio"
      itemLabel="Servicio"
      {...props}
    />
  );
}

export function ProductLinesFieldArray({
  products = [],
  ...props
}: FieldArrayProps) {
  return (
    <LinesFieldArray
      name="products"
      idKey="productId"
      entities={products}
      addLabel="Agregar producto"
      itemLabel="Producto"
      {...props}
    />
  );
}

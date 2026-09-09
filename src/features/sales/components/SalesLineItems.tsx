import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { Product } from '@/features/products/types';
import type { Service } from '@/features/services/types';
import { formatCents, toCents } from '@/lib/cents';
import {
  type Control,
  type FieldError,
  type UseFormRegister,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form';
import type { SaleFormValues } from '../schemas/sale-schema';

type LineEntity = { id: string; name: string; price: string };

type LineValues = {
  quantity: number;
  productId?: string;
  serviceId?: string;
};

type LineErrors = {
  quantity?: FieldError;
  productId?: FieldError;
  serviceId?: FieldError;
} & Record<string, FieldError | undefined>;

// Integer-cents line subtotal from the CATALOG price (read-only — the
// backend owns pricing, SL-F4). Returns null for incomplete/invalid lines.
export function lineSubtotalCents(
  line: LineValues,
  entityPrice?: string
): number | null {
  const quantity = Number(line.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || !entityPrice) {
    return null;
  }

  try {
    return toCents(entityPrice) * quantity;
  } catch {
    return null;
  }
}

type LinesFieldArrayProps = {
  name: 'productLines' | 'serviceLines';
  idKey: 'productId' | 'serviceId';
  entities: LineEntity[];
  isLoading: boolean;
  addLabel: string;
  itemLabel: string;
  control: Control<SaleFormValues>;
  register: UseFormRegister<SaleFormValues>;
};

function LinesFieldArray({
  name,
  idKey,
  entities,
  isLoading,
  addLabel,
  itemLabel,
  control,
  register,
}: LinesFieldArrayProps) {
  // `name` is a union of the two line-array keys; the cast below pins the
  // RHF generic to one side while the runtime value stays correct.
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as 'productLines',
  });
  const lines = useWatch({ control, name }) as unknown as
    | Array<LineValues>
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
          disabled={isLoading}
          onClick={() =>
            append({ [idKey]: '', quantity: 1 } as {
              productId: string;
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
        const price = line ? entityPrice(line[idKey] ?? '') : undefined;
        const subtotal = line ? lineSubtotalCents(line, price) : null;

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
                placeholder={
                  isLoading
                    ? 'Cargando…'
                    : `Seleccionar ${itemLabel.toLowerCase()}`
                }
                disabled={isLoading}
                error={itemErrors?.[idKey]?.message}
                {...register(
                  `${name}.${index}.${idKey}` as
                    | `productLines.${number}.productId`
                    | `serviceLines.${number}.serviceId`
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
                  `${name}.${index}.quantity` as
                    | `productLines.${number}.quantity`
                    | `serviceLines.${number}.quantity`
                )}
              />
              {itemErrors?.quantity && (
                <p className="text-sm text-destructive" role="alert">
                  {itemErrors.quantity.message}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Precio: {price ?? '—'}
              </p>
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
  'control' | 'register' | 'isLoading'
> & {
  products?: Product[];
};

export function ProductLinesFieldArray({
  products = [],
  ...props
}: FieldArrayProps) {
  return (
    <LinesFieldArray
      name="productLines"
      idKey="productId"
      entities={products}
      addLabel="Agregar producto"
      itemLabel="Producto"
      {...props}
    />
  );
}

type ServiceFieldArrayProps = Pick<
  LinesFieldArrayProps,
  'control' | 'register' | 'isLoading'
> & {
  services?: Service[];
};

export function ServiceLinesFieldArray({
  services = [],
  ...props
}: ServiceFieldArrayProps) {
  return (
    <LinesFieldArray
      name="serviceLines"
      idKey="serviceId"
      entities={services}
      addLabel="Agregar servicio"
      itemLabel="Servicio"
      {...props}
    />
  );
}

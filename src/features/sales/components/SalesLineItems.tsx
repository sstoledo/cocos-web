import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { Product } from '@/features/products/types';
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

type LineValues = {
  quantity: number;
  productId?: string;
};

type LineErrors = {
  quantity?: FieldError;
  productId?: FieldError;
};

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

type ProductLinesFieldArrayProps = {
  products?: Product[];
  isLoading: boolean;
  control: Control<SaleFormValues>;
  register: UseFormRegister<SaleFormValues>;
};

// Sales are products-only (decision/sales-products-only): services are
// billed exclusively through work orders, so the checkout renders a single
// product-lines field array.
export function ProductLinesFieldArray({
  products = [],
  isLoading,
  control,
  register,
}: ProductLinesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productLines',
  });
  const lines = useWatch({ control, name: 'productLines' }) as
    | Array<LineValues>
    | undefined;
  const { errors } = useFormState({ control });
  const arrayErrors = errors.productLines;

  const options = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  function productPrice(id: string) {
    return products.find((product) => product.id === id)?.price;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Producto</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => append({ productId: '', quantity: 1 })}
        >
          Agregar producto
        </Button>
      </div>

      {fields.map((field, index) => {
        const itemErrors = arrayErrors?.[index] as LineErrors | undefined;
        const line = lines?.[index];
        const price = line ? productPrice(line.productId ?? '') : undefined;
        const subtotal = line ? lineSubtotalCents(line, price) : null;

        return (
          <div
            key={field.id}
            className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <Label htmlFor={`productLines-${index}-productId`}>
                Producto
              </Label>
              <Select
                id={`productLines-${index}-productId`}
                options={options}
                placeholder={isLoading ? 'Cargando…' : 'Seleccionar producto'}
                disabled={isLoading}
                error={itemErrors?.productId?.message}
                {...register(`productLines.${index}.productId`)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`productLines-${index}-quantity`}>Cantidad</Label>
              <Input
                id={`productLines-${index}-quantity`}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                aria-invalid={itemErrors?.quantity ? 'true' : 'false'}
                {...register(`productLines.${index}.quantity`)}
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

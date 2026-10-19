import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ProductCombobox } from '@/features/products/components/ProductCombobox';
import type { Product } from '@/features/products/types';
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

type ProductLineRowProps = {
  index: number;
  line: LineValues | undefined;
  errors: LineErrors | undefined;
  register: UseFormRegister<SaleFormValues>;
  resolveProduct: (id: string) => Product | undefined;
  onProductChange: (index: number, product: Product | null) => void;
  onRemove: (index: number) => void;
};

function ProductLineRow({
  index,
  line,
  errors: itemErrors,
  register,
  resolveProduct,
  onProductChange,
  onRemove,
}: ProductLineRowProps) {
  const price = line?.productId
    ? resolveProduct(line.productId)?.price
    : undefined;
  const subtotal = line ? lineSubtotalCents(line, price) : null;

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor={`productLines-${index}-productId`}>Producto</Label>
        <ProductCombobox
          id={`productLines-${index}-productId`}
          value={
            line?.productId ? (resolveProduct(line.productId) ?? null) : null
          }
          onChange={(product) => onProductChange(index, product)}
          error={itemErrors?.productId?.message}
          isActive
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
        <p className="text-sm text-muted-foreground">Precio: {price ?? '—'}</p>
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

type ProductLinesFieldArrayProps = {
  control: Control<SaleFormValues>;
  register: UseFormRegister<SaleFormValues>;
  setValue: UseFormSetValue<SaleFormValues>;
  resolveProduct: (id: string) => Product | undefined;
  onProductChange: (index: number, product: Product | null) => void;
};

// Sales are products-only (decision/sales-products-only): services are
// billed exclusively through work orders, so the checkout renders a single
// product-lines field array. Products are picked with a server-side search
// combobox; selected products live in the parent's map so prices and
// labels survive across searches.
export function ProductLinesFieldArray({
  control,
  register,
  setValue,
  resolveProduct,
  onProductChange,
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

  function handleProductChange(index: number, product: Product | null) {
    setValue(`productLines.${index}.productId`, product?.id ?? '', {
      shouldValidate: true,
    });
    onProductChange(index, product);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Producto</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ productId: '', quantity: 1 })}
        >
          Agregar producto
        </Button>
      </div>

      {fields.map((field, index) => (
        <ProductLineRow
          key={field.id}
          index={index}
          line={lines?.[index]}
          errors={arrayErrors?.[index] as LineErrors | undefined}
          register={register}
          resolveProduct={resolveProduct}
          onProductChange={handleProductChange}
          onRemove={remove}
        />
      ))}
    </div>
  );
}

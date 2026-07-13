import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { Product } from '@/features/products/types';
import type { Control, UseFormRegister } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import type { LotFormValues } from '../types';

export type LotItemFormProps = {
  index: number;
  products: Product[];
  onRemove: () => void;
  register: UseFormRegister<LotFormValues>;
  control: Control<LotFormValues>;
};

function toProductOptions(products: Product[]) {
  return products.map((product) => ({
    value: product.id,
    label: product.name,
  }));
}

export function LotItemForm({
  index,
  products,
  onRemove,
  register,
  control,
}: LotItemFormProps) {
  const { errors } = useFormState({ control });
  const itemErrors = errors.items?.[index];
  const productOptions = toProductOptions(products);

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor={`items-${index}-productId`}>Producto</Label>
        <Select
          id={`items-${index}-productId`}
          options={productOptions}
          placeholder="Seleccionar producto"
          error={itemErrors?.productId?.message}
          {...register(`items.${index}.productId`)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`items-${index}-quantity`}>Cantidad</Label>
        <Input
          id={`items-${index}-quantity`}
          type="number"
          min="1"
          step="1"
          placeholder="0"
          aria-invalid={itemErrors?.quantity ? 'true' : 'false'}
          {...register(`items.${index}.quantity`)}
        />
        {itemErrors?.quantity && (
          <p className="text-sm text-destructive" role="alert">
            {itemErrors.quantity.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`items-${index}-costPrice`}>Precio de costo</Label>
        <Input
          id={`items-${index}-costPrice`}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          aria-invalid={itemErrors?.costPrice ? 'true' : 'false'}
          {...register(`items.${index}.costPrice`)}
        />
        {itemErrors?.costPrice && (
          <p className="text-sm text-destructive" role="alert">
            {itemErrors.costPrice.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`items-${index}-expirationDate`}>
          Fecha de vencimiento
        </Label>
        <Input
          id={`items-${index}-expirationDate`}
          type="date"
          aria-invalid={itemErrors?.expirationDate ? 'true' : 'false'}
          {...register(`items.${index}.expirationDate`)}
        />
        {itemErrors?.expirationDate && (
          <p className="text-sm text-destructive" role="alert">
            {itemErrors.expirationDate.message}
          </p>
        )}
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="w-full"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

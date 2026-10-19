import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  ProductCombobox,
  type ProductComboboxValue,
} from '@/features/products/components/ProductCombobox';
import { useState } from 'react';
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { useFormState, useWatch } from 'react-hook-form';
import type { LotFormValues } from '../types';

export type LotItemFormProps = {
  index: number;
  onRemove: () => void;
  register: UseFormRegister<LotFormValues>;
  control: Control<LotFormValues>;
  setValue: UseFormSetValue<LotFormValues>;
};

export function LotItemForm({
  index,
  onRemove,
  register,
  control,
  setValue,
}: LotItemFormProps) {
  const { errors } = useFormState({ control });
  const itemErrors = errors.items?.[index];
  const productId = useWatch({ control, name: `items.${index}.productId` });
  const [selectedProduct, setSelectedProduct] =
    useState<ProductComboboxValue | null>(null);

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor={`items-${index}-productId`}>Producto</Label>
        <ProductCombobox
          id={`items-${index}-productId`}
          value={productId ? selectedProduct : null}
          onChange={(product) => {
            setSelectedProduct(product);
            setValue(`items.${index}.productId`, product?.id ?? '', {
              shouldValidate: true,
            });
          }}
          error={itemErrors?.productId?.message}
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

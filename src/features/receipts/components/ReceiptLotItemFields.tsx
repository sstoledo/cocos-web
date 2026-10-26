import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { useFormState, useWatch } from 'react-hook-form';
import type { ReceiptReviewFormValues } from '../schemas/receipt-review-schema';
import { ReceiptProductField } from './ReceiptProductField';

type ReceiptLotItemFieldsProps = {
  index: number;
  control: Control<ReceiptReviewFormValues>;
  register: UseFormRegister<ReceiptReviewFormValues>;
  setValue: UseFormSetValue<ReceiptReviewFormValues>;
};

export function ReceiptLotItemFields({
  index,
  control,
  register,
  setValue,
}: ReceiptLotItemFieldsProps) {
  const { errors } = useFormState({ control });
  const itemErrors = errors.items?.[index];
  const productId = useWatch({ control, name: `items.${index}.productId` });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor={`receipt-items-${index}-product`}>Producto</Label>
        <ReceiptProductField
          id={`receipt-items-${index}-product`}
          description={useWatch({
            control,
            name: `items.${index}.description`,
          })}
          productId={productId}
          onChange={(product) =>
            setValue(`items.${index}.productId`, product?.id ?? '', {
              shouldValidate: true,
            })
          }
          error={itemErrors?.productId?.message}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`receipt-items-${index}-quantity`}>Cantidad</Label>
        <Input
          id={`receipt-items-${index}-quantity`}
          type="number"
          min="1"
          step="1"
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
        <Label htmlFor={`receipt-items-${index}-cost`}>Precio de costo</Label>
        <Input
          id={`receipt-items-${index}-cost`}
          type="text"
          inputMode="decimal"
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
        <Label htmlFor={`receipt-items-${index}-expiration`}>
          Fecha de vencimiento
        </Label>
        <Input
          id={`receipt-items-${index}-expiration`}
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
    </div>
  );
}

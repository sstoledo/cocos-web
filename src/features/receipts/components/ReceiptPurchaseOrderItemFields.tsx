import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import type { PurchaseOrder } from '@/features/purchase-orders/types';
import type { Control, UseFormRegister } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import type { ReceiptReviewFormValues } from '../schemas/receipt-review-schema';

type ReceiptPurchaseOrderItemFieldsProps = {
  index: number;
  purchaseOrder?: PurchaseOrder;
  control: Control<ReceiptReviewFormValues>;
  register: UseFormRegister<ReceiptReviewFormValues>;
};

export function ReceiptPurchaseOrderItemFields({
  index,
  purchaseOrder,
  control,
  register,
}: ReceiptPurchaseOrderItemFieldsProps) {
  const { errors } = useFormState({ control });
  const itemErrors = errors.items?.[index];
  const lines = (purchaseOrder?.lines ?? []).filter(
    (line) => line.quantityOrdered - line.quantityReceived > 0
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Select
        id={`receipt-items-${index}-line`}
        label="Línea de la orden"
        options={lines.map((line) => ({
          value: line.id,
          label: `${line.product.name} — Pedidas: ${line.quantityOrdered} — Pendientes: ${
            line.quantityOrdered - line.quantityReceived
          }`,
        }))}
        placeholder="Seleccioná una línea"
        disabled={!purchaseOrder}
        error={itemErrors?.lineId?.message}
        {...register(`items.${index}.lineId`)}
      />
      <div className="space-y-2">
        <Label htmlFor={`receipt-po-items-${index}-quantity`}>
          Cantidad a recibir
        </Label>
        <Input
          id={`receipt-po-items-${index}-quantity`}
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
        <Label htmlFor={`receipt-po-items-${index}-cost`}>Costo real</Label>
        <Input
          id={`receipt-po-items-${index}-cost`}
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
        <Label htmlFor={`receipt-po-items-${index}-expiration`}>
          Fecha de vencimiento
        </Label>
        <Input
          id={`receipt-po-items-${index}-expiration`}
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

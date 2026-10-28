import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { usePurchaseOrder } from '@/features/purchase-orders/hooks/use-purchase-order';
import { usePurchaseOrders } from '@/features/purchase-orders/hooks/use-purchase-orders';
import {
  SupplierCombobox,
  type SupplierComboboxValue,
} from '@/features/suppliers/components/SupplierCombobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import {
  useConfirmReceiptLot,
  useConfirmReceiptPurchaseOrder,
} from '../hooks/use-receipt-mutations';
import { getReceiptErrorMessage } from '../lib/receipt-errors';
import {
  type ReceiptReviewFormValues,
  receiptReviewSchema,
} from '../schemas/receipt-review-schema';
import type { Receipt } from '../types';
import { ReceiptLotItemFields } from './ReceiptLotItemFields';
import { ReceiptPurchaseOrderItemFields } from './ReceiptPurchaseOrderItemFields';

function defaultValues(receipt: Receipt): ReceiptReviewFormValues {
  return {
    destination: 'lot',
    supplierId: receipt.supplierId ?? '',
    lotNumber: '',
    notes: '',
    purchaseOrderId: receipt.purchaseOrderId ?? '',
    items: (receipt.extracted?.items ?? []).map((item) => ({
      description: item.description,
      productId: '',
      lineId: '',
      quantity: item.quantity,
      costPrice: item.unitPrice.toFixed(2),
      expirationDate: '',
    })),
  };
}

type ReceiptReviewFormProps = {
  receipt: Receipt;
};

export function ReceiptReviewForm({ receipt }: ReceiptReviewFormProps) {
  const navigate = useNavigate();
  const lotMutation = useConfirmReceiptLot();
  const purchaseOrderMutation = useConfirmReceiptPurchaseOrder();
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierComboboxValue | null>(receipt.supplier);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReceiptReviewFormValues>({
    resolver: zodResolver(receiptReviewSchema),
    defaultValues: defaultValues(receipt),
    mode: 'onChange',
  });
  const { fields } = useFieldArray({ control, name: 'items' });
  const destination = useWatch({ control, name: 'destination' });
  const purchaseOrderId = useWatch({ control, name: 'purchaseOrderId' });
  const watchedValues = useWatch({ control });
  const ordered = usePurchaseOrders({ status: 'ordered', limit: 50 });
  const partiallyReceived = usePurchaseOrders({
    status: 'partially_received',
    limit: 50,
  });
  const purchaseOrderQuery = usePurchaseOrder(purchaseOrderId);
  const purchaseOrders = [
    ...ordered.purchaseOrders,
    ...partiallyReceived.purchaseOrders,
  ];
  const isPending = lotMutation.isPending || purchaseOrderMutation.isPending;
  const mutationError = lotMutation.error ?? purchaseOrderMutation.error;

  if (!receipt.extracted) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Primero se debe completar la extracción OCR.
        </p>
        <Button type="button" disabled>
          Confirmar comprobante
        </Button>
      </div>
    );
  }

  function handleConfirm(values: ReceiptReviewFormValues) {
    if (values.destination === 'lot') {
      lotMutation.mutate(
        {
          id: receipt.id,
          payload: {
            supplierId: values.supplierId,
            lotNumber: values.lotNumber || undefined,
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              costPrice: Number(item.costPrice),
              expirationDate: item.expirationDate,
            })),
          },
        },
        { onSuccess: () => navigate('/lots') }
      );
      return;
    }

    purchaseOrderMutation.mutate(
      {
        id: receipt.id,
        payload: {
          purchaseOrderId: values.purchaseOrderId,
          lines: values.items.map((item) => ({
            lineId: item.lineId,
            receivedQty: item.quantity,
            expirationDate: item.expirationDate,
            actualCostPrice: item.costPrice,
          })),
        },
      },
      {
        onSuccess: () => navigate(`/purchase-orders/${values.purchaseOrderId}`),
      }
    );
  }

  const canSubmit = receiptReviewSchema.safeParse(watchedValues).success;

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(handleConfirm)}
      noValidate
    >
      <Select
        id="receipt-destination"
        label="Destino"
        options={[
          { value: 'lot', label: 'Crear lote' },
          { value: 'purchase-order', label: 'Adjuntar a Orden de Compra' },
        ]}
        {...register('destination')}
      />

      {destination === 'lot' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receipt-supplier">Proveedor</Label>
            <SupplierCombobox
              id="receipt-supplier"
              value={selectedSupplier}
              onChange={(supplier) => {
                setSelectedSupplier(supplier);
                setValue('supplierId', supplier?.id ?? '', {
                  shouldValidate: true,
                });
              }}
              error={errors.supplierId?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-lot-number">
              Número de lote (opcional)
            </Label>
            <Input
              id="receipt-lot-number"
              placeholder={`Por defecto: REC-${receipt.id}`}
              {...register('lotNumber')}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="receipt-notes">Notas (opcional)</Label>
            <Textarea id="receipt-notes" {...register('notes')} />
          </div>
        </div>
      ) : (
        <Select
          id="receipt-purchase-order"
          label="Orden de compra"
          options={purchaseOrders.map((purchaseOrder) => ({
            value: purchaseOrder.id,
            label: `${purchaseOrder.purchaseOrderNumber} — ${purchaseOrder.supplier.name}`,
          }))}
          placeholder="Seleccioná una orden ordenada o parcialmente recibida"
          error={errors.purchaseOrderId?.message}
          {...register('purchaseOrderId', {
            onChange: () => {
              fields.forEach((_, index) =>
                setValue(`items.${index}.lineId`, '', {
                  shouldValidate: true,
                })
              );
            },
          })}
        />
      )}

      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Ítems extraídos</h3>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium text-foreground">{field.description}</p>
              <p className="text-sm text-muted-foreground">
                Revisá la sugerencia y completá los datos obligatorios.
              </p>
            </div>
            {destination === 'lot' ? (
              <ReceiptLotItemFields
                index={index}
                control={control}
                register={register}
                setValue={setValue}
              />
            ) : (
              <ReceiptPurchaseOrderItemFields
                index={index}
                purchaseOrder={purchaseOrderQuery.data}
                control={control}
                register={register}
              />
            )}
          </div>
        ))}
      </div>

      {mutationError && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {getReceiptErrorMessage(mutationError)}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        No se registrará inventario hasta que confirmes esta revisión.
      </p>
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={!canSubmit || isPending}
      >
        {isPending ? 'Confirmando…' : 'Confirmar comprobante'}
      </Button>
    </form>
  );
}

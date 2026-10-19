import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { ClientCombobox } from '@/features/clients/components/ClientCombobox';
import type { Client } from '@/features/clients/types';
import type { Product } from '@/features/products/types';
import { formatCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { type SaleFormValues, saleSchema } from '../schemas/sale-schema';
import { PAYMENT_METHOD_LABELS } from './PaymentMethodBadge';
import { ProductLinesFieldArray, lineSubtotalCents } from './SalesLineItems';

export type CheckoutFormProps = {
  onSubmit: (values: SaleFormValues) => void;
  isPending?: boolean;
};

const PAYMENT_METHOD_OPTIONS = (
  Object.entries(PAYMENT_METHOD_LABELS) as Array<
    [keyof typeof PAYMENT_METHOD_LABELS, string]
  >
).map(([value, label]) => ({ value, label }));

export function CheckoutForm({
  onSubmit,
  isPending = false,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: '',
      paymentMethod: '' as SaleFormValues['paymentMethod'],
      productLines: [],
    },
  });

  const productLines = useWatch({ control, name: 'productLines' });

  // Entities selected through the async comboboxes live here so labels and
  // catalog prices survive across searches (the dropdown only ever holds
  // the top-20 of the current term).
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, Product>
  >({});

  function resolveProduct(id: string): Product | undefined {
    return selectedProducts[id];
  }

  function handleProductChange(index: number, product: Product | null) {
    setSelectedProducts((previous) => {
      const next = { ...previous };
      const line = productLines?.[index];
      if (line?.productId && line.productId !== product?.id) {
        delete next[line.productId];
      }
      if (product) {
        next[product.id] = product;
      }
      return next;
    });
  }

  const totalCents = (productLines ?? []).reduce(
    (sum, line) =>
      sum +
      (lineSubtotalCents(line, resolveProduct(line.productId)?.price) ?? 0),
    0
  );

  // The ≥1-line and duplicate-product refines report on `productLines` as
  // an array-level message.
  const linesError = (errors.productLines as { message?: string } | undefined)
    ?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de pago</Label>
          <Select
            id="paymentMethod"
            options={PAYMENT_METHOD_OPTIONS}
            placeholder="Seleccionar método de pago"
            error={errors.paymentMethod?.message}
            {...register('paymentMethod')}
          />
        </div>

        <div className="space-y-2">
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <ClientCombobox
                id="clientId"
                label="Cliente"
                clearable
                placeholder="Cliente ocasional"
                value={selectedClient}
                onChange={(client) => {
                  setSelectedClient(client);
                  field.onChange(client?.id ?? '');
                }}
                error={errors.clientId?.message}
              />
            )}
          />
          <p className="text-sm text-muted-foreground">
            Dejalo vacío para una venta de mostrador.
          </p>
        </div>
      </div>

      <ProductLinesFieldArray
        control={control}
        register={register}
        setValue={setValue}
        resolveProduct={resolveProduct}
        onProductChange={handleProductChange}
      />

      {linesError && (
        <p className="text-sm text-destructive" role="alert">
          {linesError}
        </p>
      )}

      <p className="text-lg font-semibold">Total: {formatCents(totalCents)}</p>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando…' : 'Registrar venta'}
        </Button>
        <Link
          to="/sales"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md px-4 font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { ClientCombobox } from '@/features/clients/components/ClientCombobox';
import type { Client } from '@/features/clients/types';
import type { Product } from '@/features/products/types';
import { formatCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { proformaSchema } from '../schemas/proforma-schema';
import type { ProformaFormValues } from '../schemas/proforma-schema';
import { ProductLinesFieldArray } from './ProductLinesFieldArray';

export type ProformaFormProps = {
  onSubmit: (values: ProformaFormValues) => void;
  isPending?: boolean;
  defaultValues?: Partial<ProformaFormValues>;
};

export function ProformaForm({
  onSubmit,
  isPending = false,
  defaultValues,
}: ProformaFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaSchema),
    defaultValues: {
      clientId: '',
      branchId: '',
      employeeId: '',
      notes: '',
      productLines: [],
      ...defaultValues,
    },
  });

  const productLines = useWatch({ control, name: 'productLines' });

  // Entities selected through the async comboboxes live here so labels and
  // catalog prices survive across searches.
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

  const linesError = (errors.productLines as { message?: string } | undefined)
    ?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
          Dejalo vacío para una proforma de mostrador.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <textarea
              id="notes"
              className={cn(
                'flex w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-disabled disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
                errors.notes?.message &&
                  'border-destructive focus-visible:ring-destructive'
              )}
              {...field}
            />
          )}
        />
        {errors.notes?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.notes.message}
          </p>
        )}
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
          {isPending ? 'Guardando…' : 'Guardar proforma'}
        </Button>
        <Link
          to="/proformas"
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

function lineSubtotalCents(
  line: { quantity: number; productId?: string },
  entityPrice?: string
): number | null {
  const quantity = Number(line.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || !entityPrice) {
    return null;
  }

  try {
    return (
      Number(entityPrice.replace(',', '.').replace(/[^0-9.]/g, '')) *
      100 *
      quantity
    );
  } catch {
    return null;
  }
}

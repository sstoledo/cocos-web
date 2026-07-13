import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Product } from '@/features/products/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { lotSchema } from '../schemas/lot-schema';
import type { LotFormValues } from '../types';
import { LotItemForm } from './LotItemForm';

export type LotFormProps = {
  onSubmit: (values: LotFormValues) => void;
  suppliers: Array<{ id: string; name: string }>;
  products: Product[];
  isPending?: boolean;
};

function toSelectOptions(references: Array<{ id: string; name: string }>) {
  return references.map((reference) => ({
    value: reference.id,
    label: reference.name,
  }));
}

function emptyItem(): LotFormValues['items'][number] {
  return {
    productId: '',
    quantity: 1,
    costPrice: undefined as unknown as number,
    expirationDate: undefined as unknown as Date,
  };
}

export function LotForm({
  onSubmit,
  suppliers,
  products,
  isPending = false,
}: LotFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      lotNumber: '',
      supplierId: '',
      receivedAt: undefined,
      notes: '',
      items: [emptyItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  function handleAddItem() {
    append(emptyItem());
  }

  function handleFormSubmit(values: LotFormValues) {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lotNumber">Número de lote</Label>
          <Input
            id="lotNumber"
            type="text"
            placeholder="L-2026-001"
            aria-invalid={errors.lotNumber ? 'true' : 'false'}
            {...register('lotNumber')}
          />
          {errors.lotNumber && (
            <p className="text-sm text-destructive" role="alert">
              {errors.lotNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId">Proveedor</Label>
          <Select
            id="supplierId"
            options={toSelectOptions(suppliers)}
            placeholder="Seleccionar proveedor"
            error={errors.supplierId?.message}
            {...register('supplierId')}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receivedAt">Fecha de recepción</Label>
          <Input
            id="receivedAt"
            type="date"
            aria-invalid={errors.receivedAt ? 'true' : 'false'}
            {...register('receivedAt')}
          />
          {errors.receivedAt && (
            <p className="text-sm text-destructive" role="alert">
              {errors.receivedAt.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Ítems del lote</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            Agregar ítem
          </Button>
        </div>

        {fields.map((field, index) => (
          <LotItemForm
            key={field.id}
            index={index}
            products={products}
            onRemove={() => remove(index)}
            register={register}
            control={control}
          />
        ))}

        {errors.items?.root && (
          <p className="text-sm text-destructive" role="alert">
            {errors.items.root.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creando…' : 'Crear lote'}
        </Button>
        <Link
          to="/lots"
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

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import {
  ProductCombobox,
  type ProductComboboxValue,
} from '@/features/products/components/ProductCombobox';
import type { Product } from '@/features/products/types';
import {
  SupplierCombobox,
  type SupplierComboboxValue,
} from '@/features/suppliers/components/SupplierCombobox';
import { formatCents, toCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  type UseFormRegister,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { useCreatePurchaseOrder } from '../hooks/use-create-purchase-order';
import { usePurchaseOrder } from '../hooks/use-purchase-order';
import { useUpdatePurchaseOrder } from '../hooks/use-update-purchase-order';
import { getPurchaseOrderErrorMessage } from '../lib/purchase-order-error-messages';
import {
  type PurchaseOrderFormValues,
  purchaseOrderSchema,
} from '../schemas/purchase-order-schema';
import type { CreatePurchaseOrderLineInput, PurchaseOrder } from '../types';

// Integer-cents line subtotal from the user-entered cost (cents.ts is
// arithmetic-only, WOF-F6). Returns null for incomplete/invalid lines.
export function lineSubtotalCents(
  line: Pick<PurchaseOrderFormValues['lines'][number], 'quantityOrdered'> & {
    estimatedCostPrice?: string;
  }
): number | null {
  const quantity = Number(line.quantityOrdered);

  if (!Number.isInteger(quantity) || quantity < 1 || !line.estimatedCostPrice) {
    return null;
  }

  try {
    return toCents(line.estimatedCostPrice) * quantity;
  } catch {
    return null;
  }
}

function emptyLine(): PurchaseOrderFormValues['lines'][number] {
  return { productId: '', quantityOrdered: 1, estimatedCostPrice: '' };
}

function toLineInputs(
  values: PurchaseOrderFormValues
): CreatePurchaseOrderLineInput[] {
  return values.lines.map((line) => ({
    productId: line.productId,
    quantityOrdered: line.quantityOrdered,
    estimatedCostPrice: line.estimatedCostPrice,
  }));
}

// B10 edit is draft-only and full-replace on lines: prefill the draft into
// the form and send the complete line set back on PATCH.
function toFormValues(purchaseOrder: PurchaseOrder): PurchaseOrderFormValues {
  return {
    supplierId: purchaseOrder.supplierId,
    notes: purchaseOrder.notes ?? '',
    lines: purchaseOrder.lines.map((line) => ({
      productId: line.productId,
      quantityOrdered: line.quantityOrdered,
      estimatedCostPrice: line.estimatedCostPrice,
    })),
  };
}

type PurchaseOrderFormProps = {
  mode: 'create' | 'edit';
  defaultValues: PurchaseOrderFormValues;
  // Edit mode: summaries of the currently selected entities so the async
  // comboboxes render their labels without a search.
  initialSupplier?: SupplierComboboxValue | null;
  initialProducts?: ProductComboboxValue[];
  isPending: boolean;
  cancelTo: string;
  onSubmit: (values: PurchaseOrderFormValues) => void;
};

type LineRowProps = {
  index: number;
  line: PurchaseOrderFormValues['lines'][number] | undefined;
  errors:
    | {
        productId?: { message?: string };
        quantityOrdered?: { message?: string };
        estimatedCostPrice?: { message?: string };
      }
    | undefined;
  register: UseFormRegister<PurchaseOrderFormValues>;
  resolveProduct: (id: string) => ProductComboboxValue | undefined;
  onProductChange: (index: number, product: Product | null) => void;
  onRemove: (index: number) => void;
};

function PurchaseOrderLineRow({
  index,
  line,
  errors: itemErrors,
  register,
  resolveProduct,
  onProductChange,
  onRemove,
}: LineRowProps) {
  const subtotal = line ? lineSubtotalCents(line) : null;

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor={`lines-${index}-productId`}>Producto</Label>
        <ProductCombobox
          id={`lines-${index}-productId`}
          value={
            line?.productId ? (resolveProduct(line.productId) ?? null) : null
          }
          onChange={(product) => onProductChange(index, product)}
          error={itemErrors?.productId?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`lines-${index}-quantityOrdered`}>Cantidad</Label>
        <Input
          id={`lines-${index}-quantityOrdered`}
          type="number"
          min="1"
          step="1"
          placeholder="0"
          aria-invalid={itemErrors?.quantityOrdered ? 'true' : 'false'}
          {...register(`lines.${index}.quantityOrdered`)}
        />
        {itemErrors?.quantityOrdered && (
          <p className="text-sm text-destructive" role="alert">
            {itemErrors.quantityOrdered.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`lines-${index}-estimatedCostPrice`}>
          Costo estimado
        </Label>
        {/* Text input (not type=number): the decimal string must
            reach the backend verbatim — number inputs normalize
            '50.00' to '50' and break on comma-decimal locales. */}
        <Input
          id={`lines-${index}-estimatedCostPrice`}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={itemErrors?.estimatedCostPrice ? 'true' : 'false'}
          {...register(`lines.${index}.estimatedCostPrice`)}
        />
        {itemErrors?.estimatedCostPrice && (
          <p className="text-sm text-destructive" role="alert">
            {itemErrors.estimatedCostPrice.message}
          </p>
        )}
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

function PurchaseOrderForm({
  mode,
  defaultValues,
  initialSupplier,
  initialProducts,
  isPending,
  cancelTo,
  onSubmit,
}: PurchaseOrderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });
  const lines = useWatch({ control, name: 'lines' });

  // The PATCH endpoint only replaces lines, so supplier and notes stay
  // read-only in edit mode.
  const isEdit = mode === 'edit';

  // Entities picked via async comboboxes: keyed maps so labels survive
  // across searches (the dropdown only holds the top-20 of the term).
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierComboboxValue | null>(initialSupplier ?? null);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, ProductComboboxValue>
  >(() =>
    Object.fromEntries(
      (initialProducts ?? []).map((product) => [product.id, product])
    )
  );

  function resolveProduct(id: string): ProductComboboxValue | undefined {
    return selectedProducts[id];
  }

  function handleProductChange(index: number, product: Product | null) {
    setValue(`lines.${index}.productId`, product?.id ?? '', {
      shouldValidate: true,
    });
    setSelectedProducts((previous) => {
      const next = { ...previous };
      const line = lines?.[index];
      if (line?.productId && line.productId !== product?.id) {
        delete next[line.productId];
      }
      if (product) {
        next[product.id] = product;
      }
      return next;
    });
  }

  const totalCents = (lines ?? []).reduce<number | null>((total, line) => {
    const subtotal = lineSubtotalCents(line);
    if (total === null || subtotal === null) {
      return subtotal === null ? total : subtotal;
    }
    return total + subtotal;
  }, null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplierId">Proveedor</Label>
          <SupplierCombobox
            id="supplierId"
            value={selectedSupplier}
            onChange={(supplier) => {
              setSelectedSupplier(supplier);
              setValue('supplierId', supplier?.id ?? '', {
                shouldValidate: true,
              });
            }}
            placeholder="Buscar proveedor…"
            disabled={isEdit}
            error={errors.supplierId?.message}
          />
          {isEdit && (
            <p className="text-sm text-muted-foreground">
              El proveedor no se puede cambiar en una orden existente.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales"
            disabled={isEdit}
            {...register('notes')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Líneas de la orden</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(emptyLine())}
          >
            Agregar producto
          </Button>
        </div>

        {fields.map((field, index) => (
          <PurchaseOrderLineRow
            key={field.id}
            index={index}
            line={lines?.[index]}
            errors={errors.lines?.[index]}
            register={register}
            resolveProduct={resolveProduct}
            onProductChange={handleProductChange}
            onRemove={remove}
          />
        ))}

        {/* Array-level errors land on root: empty lines (min 1) and the
            duplicate-product refine both surface here. */}
        {errors.lines?.root && (
          <p className="text-sm text-destructive" role="alert">
            {errors.lines.root.message}
          </p>
        )}

        <p className="text-right text-lg font-semibold">
          Total estimado: {totalCents === null ? '—' : formatCents(totalCents)}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isEdit
            ? isPending
              ? 'Guardando…'
              : 'Guardar cambios'
            : isPending
              ? 'Creando…'
              : 'Crear orden'}
        </Button>
        <Link
          to={cancelTo}
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

export function PurchaseOrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const {
    data: purchaseOrder,
    isLoading: isLoadingPurchaseOrder,
    error: purchaseOrderError,
  } = usePurchaseOrder(id ?? '');

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();

  const mutation = isEdit ? updateMutation : createMutation;

  function handleCreate(values: PurchaseOrderFormValues) {
    createMutation.mutate(
      {
        supplierId: values.supplierId,
        ...(values.notes ? { notes: values.notes } : {}),
        lines: toLineInputs(values),
      },
      {
        onSuccess: (created) => navigate(`/purchase-orders/${created.id}`),
      }
    );
  }

  function handleUpdate(values: PurchaseOrderFormValues) {
    if (!id) {
      return;
    }

    updateMutation.mutate(
      { id, payload: { lines: toLineInputs(values) } },
      { onSuccess: () => navigate(`/purchase-orders/${id}`) }
    );
  }

  // In edit mode the guards below narrow this to a draft purchase order.
  const draftToEdit = isEdit ? purchaseOrder : undefined;

  if (isEdit) {
    if (isLoadingPurchaseOrder) {
      return (
        <output className="block py-8 text-center text-muted-foreground">
          Cargando orden de compra…
        </output>
      );
    }

    if (purchaseOrderError || !draftToEdit) {
      return (
        <div className="p-6">
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            role="alert"
          >
            No se pudieron cargar los datos. Intentá de nuevo más tarde.
          </div>
        </div>
      );
    }

    if (draftToEdit.status !== 'draft') {
      return (
        <div className="p-6">
          <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
            <p>Solo se pueden editar órdenes en borrador.</p>
            <Link
              to={`/purchase-orders/${draftToEdit.id}`}
              className="text-primary underline"
            >
              Volver a la orden
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle>
          {draftToEdit
            ? `Editar orden ${draftToEdit.purchaseOrderNumber}`
            : 'Nueva orden de compra'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title={isEdit ? 'Editar borrador' : 'Datos de la orden'}>
          {mutation.error && (
            <div
              className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {getPurchaseOrderErrorMessage(mutation.error)}
            </div>
          )}
          <PurchaseOrderForm
            mode={draftToEdit ? 'edit' : 'create'}
            defaultValues={
              draftToEdit
                ? toFormValues(draftToEdit)
                : {
                    supplierId: '',
                    notes: '',
                    lines: [emptyLine()],
                  }
            }
            initialSupplier={draftToEdit?.supplier}
            initialProducts={draftToEdit?.lines.map((line) => ({
              id: line.product.id,
              name: line.product.name,
            }))}
            isPending={mutation.isPending}
            cancelTo={
              draftToEdit
                ? `/purchase-orders/${draftToEdit.id}`
                : '/purchase-orders'
            }
            onSubmit={draftToEdit ? handleUpdate : handleCreate}
          />
        </SectionCard>
      </PageContent>
    </>
  );
}

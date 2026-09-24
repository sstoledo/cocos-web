import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useSuppliers } from '@/features/lots/hooks/use-suppliers';
import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { formatCents, toCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
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
  suppliers: Array<{ id: string; name: string }>;
  products: Product[];
  isPending: boolean;
  cancelTo: string;
  onSubmit: (values: PurchaseOrderFormValues) => void;
};

function PurchaseOrderForm({
  mode,
  defaultValues,
  suppliers,
  products,
  isPending,
  cancelTo,
  onSubmit,
}: PurchaseOrderFormProps) {
  const {
    register,
    handleSubmit,
    control,
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
          <Select
            id="supplierId"
            options={suppliers.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            }))}
            placeholder="Seleccionar proveedor"
            disabled={isEdit}
            error={errors.supplierId?.message}
            {...register('supplierId')}
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

        {fields.map((field, index) => {
          const itemErrors = errors.lines?.[index];
          const line = lines?.[index];
          const subtotal = line ? lineSubtotalCents(line) : null;

          return (
            <div
              key={field.id}
              className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              <div className="space-y-2">
                <Label htmlFor={`lines-${index}-productId`}>Producto</Label>
                <Select
                  id={`lines-${index}-productId`}
                  options={products.map((product) => ({
                    value: product.id,
                    label: product.name,
                  }))}
                  placeholder="Seleccionar producto"
                  error={itemErrors?.productId?.message}
                  {...register(`lines.${index}.productId`)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`lines-${index}-quantityOrdered`}>
                  Cantidad
                </Label>
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
                  aria-invalid={
                    itemErrors?.estimatedCostPrice ? 'true' : 'false'
                  }
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
                  onClick={() => remove(index)}
                  className="w-full"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          );
        })}

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
    suppliers,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useSuppliers();

  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({});

  const {
    data: purchaseOrder,
    isLoading: isLoadingPurchaseOrder,
    error: purchaseOrderError,
  } = usePurchaseOrder(id ?? '');

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();

  const catalogsLoading = isLoadingSuppliers || isLoadingProducts;
  const catalogsError = suppliersError || productsError;
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
          {catalogsLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando catálogos…
            </output>
          ) : catalogsError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los catálogos. Intentá de nuevo más tarde.
            </div>
          ) : (
            <>
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
                suppliers={suppliers}
                products={products}
                isPending={mutation.isPending}
                cancelTo={
                  draftToEdit
                    ? `/purchase-orders/${draftToEdit.id}`
                    : '/purchase-orders'
                }
                onSubmit={draftToEdit ? handleUpdate : handleCreate}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

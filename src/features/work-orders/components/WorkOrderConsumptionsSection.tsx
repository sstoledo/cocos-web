import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SectionCard } from '@/components/ui/SectionCard';
import { Select } from '@/components/ui/Select';
import { ProductCombobox } from '@/features/products/components/ProductCombobox';
import type { Product } from '@/features/products/types';
import { useOpenContainers } from '@/features/stock/hooks/use-open-containers';
import { Dialog } from '@base-ui/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateWorkOrderConsumption } from '../hooks/use-create-work-order-consumption';
import { useWorkOrderConsumptions } from '../hooks/use-work-order-consumptions';
import { getWorkOrderConsumptionErrorMessage } from '../lib/work-order-consumption-error-messages';
import {
  type WorkOrderConsumptionFormValues,
  workOrderConsumptionSchema,
} from '../schemas/work-order-consumption-schema';
import type {
  ConsumptionEvent,
  ConsumptionEventType,
  WorkOrder,
} from '../types';

const CONSUMPTION_EVENT_LABELS: Record<ConsumptionEventType, string> = {
  used: 'Usó unidades',
  opened: 'Abrió envase',
  depleted: 'Terminó envase',
};

const CONSUMPTION_TYPE_OPTIONS: Record<ConsumptionEventType, string> = {
  used: 'Usar unidades',
  opened: 'Abrir envase',
  depleted: 'Terminar envase',
};

const PARTIAL_TYPES: ConsumptionEventType[] = ['used', 'opened', 'depleted'];
const DIRECT_TYPES: ConsumptionEventType[] = ['used'];

function formatEventType(event: ConsumptionEvent): string {
  if (event.type === 'used' && event.quantity != null) {
    return `Usó ${event.quantity} unidad(es)`;
  }
  return CONSUMPTION_EVENT_LABELS[event.type];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function allowedTypesFor(product: Product | undefined): ConsumptionEventType[] {
  return product?.consumptionType === 'partial' ? PARTIAL_TYPES : DIRECT_TYPES;
}

type OpenContainerWarningProps = {
  product: Product | undefined;
};

function OpenContainerWarning({ product }: OpenContainerWarningProps) {
  const { data } = useOpenContainers(
    product?.id ?? '',
    product?.consumptionType === 'partial'
  );

  if (!data || data.openContainers <= 0) {
    return null;
  }

  const lastOpened = data.lastOpened;
  return (
    <output className="block rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
      Hay {data.openContainers} envase(s) abierto(s) de este producto
      {lastOpened
        ? ` (último abierto en ${lastOpened.workOrderNumber} por ${lastOpened.registeredBy.name})`
        : ''}
      . Considerá reutilizarlo antes de abrir uno nuevo.
    </output>
  );
}

type ConsumptionFormProps = {
  workOrderId: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (values: WorkOrderConsumptionFormValues) => void;
  onCancel: () => void;
};

function ConsumptionForm({
  workOrderId,
  isPending,
  error,
  onSubmit,
  onCancel,
}: ConsumptionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderConsumptionFormValues>({
    resolver: zodResolver(workOrderConsumptionSchema),
    defaultValues: {
      productId: '',
      type: '' as WorkOrderConsumptionFormValues['type'],
      quantity: '',
    },
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const type = watch('type');
  const allowedTypes = allowedTypesFor(selectedProduct ?? undefined);

  // Switching products can invalidate the selected event type (a direct
  // product only accepts 'used'), so reset it to a valid default.
  useEffect(() => {
    if (type && !allowedTypes.includes(type)) {
      setValue('type', allowedTypes[0]);
    }
  }, [allowedTypes, type, setValue]);

  const typeOptions = allowedTypes.map((value) => ({
    value,
    label: CONSUMPTION_TYPE_OPTIONS[value],
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 space-y-4"
      noValidate
      data-work-order-id={workOrderId}
    >
      {error != null && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {getWorkOrderConsumptionErrorMessage(error)}
        </div>
      )}

      <ProductCombobox
        id="consumption-product"
        label="Producto"
        withCode
        isActive
        value={selectedProduct}
        onChange={(product) => {
          setSelectedProduct(product);
          setValue('productId', product?.id ?? '', { shouldValidate: true });
        }}
        error={errors.productId?.message}
      />

      <OpenContainerWarning product={selectedProduct ?? undefined} />

      <Select
        id="consumption-type"
        label="Tipo de evento"
        options={typeOptions}
        placeholder="Seleccionar tipo de evento"
        error={errors.type?.message}
        {...register('type')}
      />

      {type === 'used' && (
        <div className="space-y-2">
          <Label htmlFor="consumption-quantity">Cantidad</Label>
          <Input
            id="consumption-quantity"
            type="number"
            min="1"
            step="1"
            aria-invalid={errors.quantity ? 'true' : 'false'}
            {...register('quantity')}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive" role="alert">
              {errors.quantity.message}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando…' : 'Registrar consumo'}
        </Button>
      </div>
    </form>
  );
}

export type WorkOrderConsumptionsSectionProps = {
  workOrder: WorkOrder;
  canRegister: boolean;
};

export function WorkOrderConsumptionsSection({
  workOrder,
  canRegister,
}: WorkOrderConsumptionsSectionProps) {
  const consumptionsQuery = useWorkOrderConsumptions(workOrder.id);
  const createConsumption = useCreateWorkOrderConsumption();
  const [dialogOpen, setDialogOpen] = useState(false);

  const consumptions = Array.isArray(consumptionsQuery.data)
    ? consumptionsQuery.data
    : [];

  function handleSubmit(values: WorkOrderConsumptionFormValues) {
    createConsumption.mutate(
      {
        workOrderId: workOrder.id,
        payload: {
          productId: values.productId,
          type: values.type,
          ...(values.type === 'used'
            ? { quantity: Number(values.quantity) }
            : {}),
        },
      },
      { onSuccess: () => setDialogOpen(false) }
    );
  }

  return (
    <SectionCard title="Consumo de productos">
      <div className="space-y-4">
        {consumptionsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando consumos…</p>
        ) : consumptionsQuery.error ? (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            role="alert"
          >
            No se pudieron cargar los consumos. Intentá de nuevo más tarde.
          </div>
        ) : consumptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 font-medium">Evento</th>
                  <th className="px-3 py-2 font-medium">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {consumptions.map((event) => (
                  <tr key={event.id} className="border-b border-border">
                    <td className="px-3 py-2">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      {event.product.code} — {event.product.name}
                    </td>
                    <td className="px-3 py-2">{formatEventType(event)}</td>
                    <td className="px-3 py-2">{event.registeredBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay consumos registrados.
          </p>
        )}

        {canRegister && (
          <>
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Registrar consumo
            </Button>
            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <Dialog.Popup className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg outline-none">
                    <Dialog.Title className="text-lg font-semibold">
                      Registrar consumo
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                      Orden {workOrder.orderNumber}
                    </Dialog.Description>
                    <ConsumptionForm
                      workOrderId={workOrder.id}
                      isPending={createConsumption.isPending}
                      error={createConsumption.error}
                      onSubmit={handleSubmit}
                      onCancel={() => setDialogOpen(false)}
                    />
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
      </div>
    </SectionCard>
  );
}

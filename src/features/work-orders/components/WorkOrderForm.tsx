import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useVehicles } from '@/features/clients/hooks/use-vehicles';
import { useProducts } from '@/features/products/hooks/use-products';
import { useServices } from '@/features/services/hooks/use-services';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { formatCents } from '../lib/cents';
import {
  type WorkOrderFormValues,
  workOrderSchema,
} from '../schemas/work-order-schema';
import {
  ProductLinesFieldArray,
  ServiceLinesFieldArray,
  lineSubtotalCents,
} from './WorkOrderLineItems';

export const SELECTOR_LIMIT = 100;

export type WorkOrderFormProps = {
  onSubmit: (values: WorkOrderFormValues) => void;
  isPending?: boolean;
  initialValues?: WorkOrderFormValues;
};

export function WorkOrderForm({
  onSubmit,
  isPending = false,
  initialValues,
}: WorkOrderFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: initialValues ?? {
      clientId: '',
      vehicleId: '',
      description: '',
      services: [],
      products: [],
    },
  });

  const clientId = useWatch({ control, name: 'clientId' });
  const serviceLines = useWatch({ control, name: 'services' });
  const productLines = useWatch({ control, name: 'products' });

  const { clients, isLoading: isLoadingClients } = useClients({
    limit: SELECTOR_LIMIT,
  });
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles({
    clientId: clientId ?? '',
    limit: SELECTOR_LIMIT,
  });
  const { services, isLoading: isLoadingServices } = useServices({});
  const { products, isLoading: isLoadingProducts } = useProducts({});

  // Dependent selector: reset the vehicle whenever the client changes.
  const previousClientId = useRef(clientId);
  useEffect(() => {
    if (previousClientId.current !== clientId) {
      previousClientId.current = clientId;
      setValue('vehicleId', '');
    }
  }, [clientId, setValue]);

  const totalCents =
    (serviceLines ?? []).reduce(
      (sum, line) =>
        sum +
        (lineSubtotalCents(
          line,
          services.find((service) => service.id === line.serviceId)?.price
        ) ?? 0),
      0
    ) +
    (productLines ?? []).reduce(
      (sum, line) =>
        sum +
        (lineSubtotalCents(
          line,
          products.find((product) => product.id === line.productId)?.price
        ) ?? 0),
      0
    );

  const linesError =
    errors.services?.root?.message ??
    (errors.services as { message?: string } | undefined)?.message;

  // Edit mode renders uncontrolled selects pre-filled via defaultValues; the
  // defaults are only applied on mount, so wait for the selector catalogs
  // before mounting the form (ProductFormPage precedent).
  if (
    isEditMode &&
    (isLoadingClients ||
      isLoadingVehicles ||
      isLoadingServices ||
      isLoadingProducts)
  ) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente</Label>
          <Select
            id="clientId"
            options={clients.map((client) => ({
              value: client.id,
              label: client.name,
            }))}
            placeholder="Seleccionar cliente"
            error={errors.clientId?.message}
            {...register('clientId')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehículo</Label>
          <Select
            id="vehicleId"
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.plate} — ${vehicle.brand} ${vehicle.model}`,
            }))}
            placeholder="Seleccionar vehículo"
            disabled={!clientId}
            error={errors.vehicleId?.message}
            {...register('vehicleId')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Descripción del trabajo a realizar"
          aria-invalid={errors.description ? 'true' : 'false'}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <ServiceLinesFieldArray
        services={services}
        control={control}
        register={register}
        setValue={setValue}
      />

      <ProductLinesFieldArray
        products={products}
        control={control}
        register={register}
        setValue={setValue}
      />

      {linesError && (
        <p className="text-sm text-destructive" role="alert">
          {linesError}
        </p>
      )}

      <p className="text-lg font-semibold">Total: {formatCents(totalCents)}</p>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditMode
              ? 'Guardando…'
              : 'Creando…'
            : isEditMode
              ? 'Guardar cambios'
              : 'Crear orden'}
        </Button>
        <Link
          to="/work-orders"
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

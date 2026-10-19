import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  ClientCombobox,
  type ClientComboboxValue,
} from '@/features/clients/components/ClientCombobox';
import { useVehicles } from '@/features/clients/hooks/use-vehicles';
import { useEmployees } from '@/features/employees/hooks/use-employees';
import type { ServiceComboboxValue } from '@/features/services/components/ServiceCombobox';
import type { Service } from '@/features/services/types';
import { formatCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import {
  type WorkOrderFormValues,
  workOrderSchema,
} from '../schemas/work-order-schema';
import {
  ServiceLinesFieldArray,
  lineSubtotalCents,
} from './WorkOrderLineItems';

export const SELECTOR_LIMIT = 100;

export type WorkOrderFormProps = {
  onSubmit: (values: WorkOrderFormValues) => void;
  isPending?: boolean;
  initialValues?: WorkOrderFormValues;
  // Edit mode: summaries of the currently selected entities so the async
  // comboboxes render their labels without a search.
  initialClient?: ClientComboboxValue;
  initialServices?: ServiceComboboxValue[];
};

export function WorkOrderForm({
  onSubmit,
  isPending = false,
  initialValues,
  initialClient,
  initialServices,
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
    },
  });

  const clientId = useWatch({ control, name: 'clientId' });
  const serviceLines = useWatch({ control, name: 'services' });

  const { vehicles, isLoading: isLoadingVehicles } = useVehicles({
    clientId: clientId ?? '',
    limit: SELECTOR_LIMIT,
  });
  const { employees, isLoading: isLoadingEmployees } = useEmployees();

  // Entities picked via async comboboxes: keyed maps so labels and catalog
  // prices survive across searches.
  const [selectedClient, setSelectedClient] =
    useState<ClientComboboxValue | null>(initialClient ?? null);
  const [selectedServices, setSelectedServices] = useState<
    Record<string, ServiceComboboxValue>
  >(() =>
    Object.fromEntries(
      (initialServices ?? []).map((service) => [service.id, service])
    )
  );

  function resolveService(id: string): ServiceComboboxValue | undefined {
    return selectedServices[id];
  }

  function handleServiceChange(index: number, service: Service | null) {
    setSelectedServices((previous) => {
      const next = { ...previous };
      const line = serviceLines?.[index];
      if (line?.serviceId && line.serviceId !== service?.id) {
        delete next[line.serviceId];
      }
      if (service) {
        next[service.id] = service;
      }
      return next;
    });
  }

  // Dependent selector: reset the vehicle whenever the client changes.
  const previousClientId = useRef(clientId);
  useEffect(() => {
    if (previousClientId.current !== clientId) {
      previousClientId.current = clientId;
      setValue('vehicleId', '');
    }
  }, [clientId, setValue]);

  const totalCents = (serviceLines ?? []).reduce(
    (sum, line) =>
      sum +
      (lineSubtotalCents(line, resolveService(line.serviceId)?.price) ?? 0),
    0
  );

  const linesError =
    errors.services?.root?.message ??
    (errors.services as { message?: string } | undefined)?.message;

  // Edit mode renders uncontrolled selects pre-filled via defaultValues; the
  // defaults are only applied on mount, so wait for the bounded catalogs
  // (vehicles, employees) before mounting the form. Clients and services
  // use async comboboxes and render from `initialClient`/`initialServices`.
  if (isEditMode && (isLoadingVehicles || isLoadingEmployees)) {
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
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <ClientCombobox
                id="clientId"
                label="Cliente"
                placeholder="Buscar cliente…"
                value={selectedClient}
                onChange={(client) => {
                  setSelectedClient(client);
                  field.onChange(client?.id ?? '');
                }}
                error={errors.clientId?.message}
              />
            )}
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
        <Label htmlFor="employeeId">Mecánico asignado</Label>
        <Select
          id="employeeId"
          options={employees.map((employee) => ({
            value: employee.id,
            label: employee.specialty
              ? `${employee.name} — ${employee.specialty}`
              : employee.name,
          }))}
          placeholder="Sin asignar"
          optional
          error={errors.employeeId?.message}
          {...register('employeeId')}
        />
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
        control={control}
        register={register}
        setValue={setValue}
        resolveService={resolveService}
        onServiceChange={handleServiceChange}
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

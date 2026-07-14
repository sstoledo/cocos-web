import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useUser } from '@/features/shell/hooks/useUser';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { VehicleForm } from '../components/VehicleForm';
import { VehicleList } from '../components/VehicleList';
import { useClient } from '../hooks/use-client';
import { useCreateVehicle } from '../hooks/use-create-vehicle';
import { useDeleteVehicle } from '../hooks/use-delete-vehicle';
import { useUpdateVehicle } from '../hooks/use-update-vehicle';
import { useVehicles } from '../hooks/use-vehicles';
import type { Vehicle, VehicleFormValues } from '../types';

const DEFAULT_LIMIT = 10;

function toFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    notes: vehicle.notes,
    clientId: vehicle.clientId,
  };
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { user } = useUser();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const canEdit =
    user?.role?.name === 'Admin' || user?.role?.name === 'Reception';

  const {
    data: client,
    isLoading: isLoadingClient,
    error: clientError,
  } = useClient(id ?? '');

  const {
    vehicles,
    meta,
    isLoading: isLoadingVehicles,
  } = useVehicles({
    clientId: id ?? '',
    page,
    limit: DEFAULT_LIMIT,
  });

  function handlePageChange(nextPage: number) {
    setSearchParams({ page: nextPage.toString() }, { replace: true });
  }

  function handleOpenCreate() {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  }

  function handleSubmit(values: VehicleFormValues) {
    if (selectedVehicle) {
      updateVehicle.mutate(
        { id: selectedVehicle.id, values },
        { onSuccess: () => handleCloseForm() }
      );
    } else {
      createVehicle.mutate(values, { onSuccess: () => handleCloseForm() });
    }
  }

  function handleDelete(vehicle: Vehicle) {
    if (window.confirm('¿Estás seguro de que querés eliminar este vehículo?')) {
      deleteVehicle.mutate({ id: vehicle.id, clientId: vehicle.clientId });
    }
  }

  const isFormPending = createVehicle.isPending || updateVehicle.isPending;

  if (isLoadingClient) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (clientError || !client) {
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

  return (
    <>
      <PageHeader>
        <PageTitle>{client.name}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del cliente">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Identificación</dt>
              <dd className="text-foreground">
                {client.identification
                  ? `${client.identificationType ?? ''} ${client.identification}`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Teléfono</dt>
              <dd className="text-foreground">{client.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-foreground">{client.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Dirección</dt>
              <dd className="text-foreground">{client.address ?? '—'}</dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Vehículos">
          {isLoadingVehicles ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando vehículos…
            </output>
          ) : (
            <div className="space-y-4">
              {canEdit && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleOpenCreate}
                    disabled={isFormOpen}
                  >
                    Nuevo vehículo
                  </Button>
                </div>
              )}
              <VehicleList
                vehicles={vehicles}
                canEdit={canEdit}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
              {isFormOpen && (
                <VehicleForm
                  key={selectedVehicle?.id ?? 'create'}
                  clientId={client.id}
                  initialValues={
                    selectedVehicle ? toFormValues(selectedVehicle) : undefined
                  }
                  onSubmit={handleSubmit}
                  onCancel={handleCloseForm}
                  isPending={isFormPending}
                />
              )}
              {meta && meta.totalPages > 1 && (
                <Pagination meta={meta} onPageChange={handlePageChange} />
              )}
            </div>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

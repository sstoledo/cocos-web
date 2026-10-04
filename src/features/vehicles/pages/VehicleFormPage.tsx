import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { VehicleForm } from '../components/VehicleForm';
import { useClientsSelect } from '../hooks/use-clients-select';
import { useCreateVehicle } from '../hooks/use-create-vehicle';
import { useUpdateVehicle } from '../hooks/use-update-vehicle';
import { useVehicle } from '../hooks/use-vehicle';
import type { Vehicle, VehicleFormValues } from '../types';

function vehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year ?? undefined,
    color: vehicle.color ?? undefined,
    notes: vehicle.notes ?? undefined,
    clientId: vehicle.clientId,
    isActive: vehicle.isActive,
  };
}

export function VehicleFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useVehicle(id ?? '');

  const {
    clients,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useClientsSelect();

  const {
    mutate: createVehicle,
    isPending: isCreating,
    error: createError,
  } = useCreateVehicle();

  const {
    mutate: updateVehicle,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateVehicle();

  function handleSubmit(values: VehicleFormValues) {
    if (isEditMode && id) {
      updateVehicle(
        { id, values },
        {
          onSuccess: () => {
            navigate('/vehicles');
          },
        }
      );
    } else {
      createVehicle(values, {
        onSuccess: () => {
          navigate('/vehicles');
        },
      });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar el vehículo. Intentá de nuevo más tarde.'
      : 'No se pudo crear el vehículo. Intentá de nuevo más tarde.'
    : null;

  const isLoading = isEditMode ? isLoadingVehicle || isLoadingClients : false;

  const fatalError = isEditMode ? vehicleError : null;
  const clientsFatalError = isEditMode ? clientsError : null;

  const loadingMessage = isEditMode
    ? 'Cargando vehículo…'
    : 'Cargando clientes…';

  const fatalErrorMessage =
    'No se pudieron cargar los datos. Intentá de nuevo más tarde.';

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar vehículo' : 'Nuevo vehículo'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del vehículo">
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              {loadingMessage}
            </output>
          ) : fatalError || clientsFatalError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {fatalErrorMessage}
            </div>
          ) : (
            <>
              {errorMessage && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}
              <VehicleForm
                onSubmit={handleSubmit}
                isPending={isPending}
                clients={clients}
                initialValues={
                  isEditMode && vehicle
                    ? vehicleToFormValues(vehicle)
                    : undefined
                }
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { useParams, useSearchParams } from 'react-router';
import { VehicleList } from '../components/VehicleList';
import { useClient } from '../hooks/use-client';
import { useVehicles } from '../hooks/use-vehicles';

const DEFAULT_LIMIT = 10;

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;

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
              <VehicleList vehicles={vehicles} />
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

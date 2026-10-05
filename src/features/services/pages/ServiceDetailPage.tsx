import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useParams } from 'react-router';
import { useService } from '../hooks/use-service';

function formatPrice(price: string): string {
  const num = Number(price);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDuration(duration: number | null | undefined): string {
  if (duration === null || duration === undefined) {
    return '—';
  }
  if (duration < 60) {
    return `${duration} min`;
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isLoading, error } = useService(id ?? '');

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (error || !service) {
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
        <PageTitle>{service.name}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del servicio">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Código</dt>
              <dd className="text-foreground">{service.code}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Precio</dt>
              <dd className="text-foreground tabular-nums">
                {formatPrice(service.price)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Duración estimada
              </dt>
              <dd className="text-foreground">
                {formatDuration(service.estimatedDuration)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Estado</dt>
              <dd className="text-foreground">
                {service.isActive ? 'Activo' : 'Inactivo'}
              </dd>
            </div>
            {service.description ? (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Descripción</dt>
                <dd className="text-foreground">{service.description}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Creado</dt>
              <dd className="text-foreground">
                {formatDate(service.createdAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Actualizado</dt>
              <dd className="text-foreground">
                {formatDate(service.updatedAt)}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </PageContent>
    </>
  );
}

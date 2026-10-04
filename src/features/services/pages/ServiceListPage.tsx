import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router';
import { ServiceTable } from '../components/ServiceTable';
import { useServices } from '../hooks/use-services';
import type { ServiceListFilters } from '../types';

function filtersFromSearchParams(
  searchParams: URLSearchParams
): ServiceListFilters {
  return {
    q: searchParams.get('q') || undefined,
    isActive: parseIsActive(searchParams.get('isActive')),
  };
}

function parseIsActive(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function ServiceListPage() {
  const [searchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { services, isLoading, error } = useServices(filters);

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Servicios</PageTitle>
        <Link
          to="/services/new"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Nuevo servicio
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Catálogo de servicios">
          <div className="space-y-4">
            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando servicios…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los servicios. Intentá de nuevo más tarde.
              </div>
            ) : (
              <ServiceTable services={services} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}

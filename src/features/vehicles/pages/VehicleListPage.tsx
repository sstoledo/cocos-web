import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { IconSearch } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router';
import { VehicleTable } from '../components/VehicleTable';
import { useVehicles } from '../hooks/use-vehicles';
import type { PaginationMeta, VehicleListFilters } from '../types';

function filtersFromSearchParams(
  searchParams: URLSearchParams
): VehicleListFilters {
  return {
    q: searchParams.get('q') || undefined,
    page: Number.parseInt(searchParams.get('page') || '1', 10),
    limit: Number.parseInt(searchParams.get('limit') || '10', 10),
    isActive: parseIsActive(searchParams.get('isActive')),
  };
}

function parseIsActive(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function toSearchParams(filters: VehicleListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.isActive !== undefined)
    params.set('isActive', filters.isActive.toString());
  return params;
}

export function VehicleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);
  const { vehicles, meta, isLoading, error } = useVehicles(filters);

  function handleSearch(q: string) {
    const newFilters = { ...filters, q: q || undefined, page: 1 };
    setSearchParams(toSearchParams(newFilters));
  }

  function handlePageChange(page: number) {
    const newFilters = { ...filters, page };
    setSearchParams(toSearchParams(newFilters));
  }

  function handleActiveFilterChange(isActive: boolean | undefined) {
    const newFilters = { ...filters, isActive, page: 1 };
    setSearchParams(toSearchParams(newFilters));
  }

  const displayMeta: PaginationMeta = meta ?? {
    page: filters.page ?? 1,
    total: 0,
    totalPages: 1,
  };

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Vehículos</PageTitle>
        <Link
          to="/vehicles/new"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground transition-colors',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Nuevo vehículo
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Catálogo de vehículos">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-xs">
                <IconSearch
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Buscar por placa, marca o modelo…"
                  value={filters.q || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Buscar vehículos"
                />
              </div>
              <select
                value={
                  filters.isActive === true
                    ? 'true'
                    : filters.isActive === false
                      ? 'false'
                      : ''
                }
                onChange={(e) =>
                  handleActiveFilterChange(
                    e.target.value === 'true'
                      ? true
                      : e.target.value === 'false'
                        ? false
                        : undefined
                  )
                }
                className="flex h-10 w-full max-w-xs items-center rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            {isLoading ? (
              <output className="block py-8 text-center text-muted-foreground">
                Cargando vehículos…
              </output>
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los vehículos. Intentá de nuevo más tarde.
              </div>
            ) : (
              <VehicleTable
                vehicles={vehicles}
                meta={displayMeta}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}

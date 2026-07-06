import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';
import { IconCash, IconLayoutDashboard, IconTools } from '@tabler/icons-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useRecentActivity } from '../hooks/useRecentActivity';

const statDefinitions = [
  {
    label: 'Resumen',
    description: 'Métricas del día',
    icon: IconLayoutDashboard,
  },
  { label: 'Órdenes', description: 'Pendientes hoy', icon: IconTools },
  { label: 'Ventas', description: 'Total mensual', icon: IconCash },
] as const;

const statsGridClassName =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3';

export function DashboardPage() {
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    activities,
    isLoading: isActivityLoading,
    error: activityError,
  } = useRecentActivity();

  const hasError = statsError != null || activityError != null;

  const statsGrid = (
    <div className={statsGridClassName}>
      {statDefinitions.map(({ label, description, icon }) => {
        const stat = stats.find((item) => item.label === label);
        const value = stat ? stat.value : '—';
        return (
          <StatCard
            key={label}
            label={label}
            value={value}
            description={description}
            icon={icon}
            className={cn(isStatsLoading && 'animate-pulse')}
          />
        );
      })}
    </div>
  );

  return (
    <PageContent>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>

      {hasError && (
        <p className="text-body-sm text-destructive" role="alert">
          No se pudieron cargar los datos
        </p>
      )}

      {isStatsLoading ? (
        <output aria-busy="true" aria-label="Cargando estadísticas">
          {statsGrid}
        </output>
      ) : (
        statsGrid
      )}

      <SectionCard title="Actividad reciente">
        {isActivityLoading ? (
          <output
            aria-busy="true"
            aria-label="Cargando actividad"
            className="space-y-3"
          >
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </output>
        ) : activities.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No hay actividad reciente.
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between"
              >
                <span className="text-body text-foreground">
                  {activity.description}
                </span>
                <span className="text-body-sm text-muted-foreground">
                  {activity.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageContent>
  );
}

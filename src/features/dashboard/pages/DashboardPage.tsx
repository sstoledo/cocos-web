import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';
import {
  IconBell,
  IconCalendarMonth,
  IconCash,
  IconClipboardList,
  IconShoppingCart,
  IconTools,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router';
import { useDashboardSummary } from '../hooks/use-dashboard-summary';
import type { DashboardSummary } from '../types';

type StatCardDefinition = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  getValue: (summary: DashboardSummary) => number;
};

// Card definitions per the F11 doc decisions: OC por recibir sums
// ordered + partiallyReceived; the notifications card links to /notifications.
const statDefinitions: StatCardDefinition[] = [
  {
    label: 'Ventas de hoy',
    to: '/sales',
    icon: IconCash,
    getValue: (summary) => summary.salesTodayCount,
  },
  {
    label: 'Ventas del mes',
    to: '/sales',
    icon: IconCalendarMonth,
    getValue: (summary) => summary.salesMonthCount,
  },
  {
    label: 'Órdenes pendientes',
    to: '/work-orders',
    icon: IconClipboardList,
    getValue: (summary) => summary.workOrders.pending,
  },
  {
    label: 'Órdenes en curso',
    to: '/work-orders',
    icon: IconTools,
    getValue: (summary) => summary.workOrders.inProgress,
  },
  {
    label: 'OC por recibir',
    to: '/purchase-orders',
    icon: IconShoppingCart,
    getValue: (summary) =>
      summary.purchaseOrders.ordered + summary.purchaseOrders.partiallyReceived,
  },
  {
    label: 'Notificaciones sin leer',
    to: '/notifications',
    icon: IconBell,
    getValue: (summary) => summary.notificationsUnread,
  },
];

const statsGridClassName =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3';

export function DashboardPage() {
  const { summary, isLoading, error } = useDashboardSummary();

  const statsGrid = (
    <div className={statsGridClassName}>
      {statDefinitions.map(({ label, to, icon, getValue }) => (
        <Link key={label} to={to} className="block">
          <StatCard
            label={label}
            value={summary ? getValue(summary) : undefined}
            icon={icon}
            className={cn(
              'h-full transition-colors hover:bg-muted/50',
              isLoading && 'animate-pulse'
            )}
          />
        </Link>
      ))}
    </div>
  );

  return (
    <PageContent>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>

      {error != null ? (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {error.message}
        </div>
      ) : isLoading ? (
        <output aria-busy="true" aria-label="Cargando estadísticas">
          {statsGrid}
        </output>
      ) : (
        statsGrid
      )}
    </PageContent>
  );
}

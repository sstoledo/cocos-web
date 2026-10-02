import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { IconCashRegister } from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useCashClosings } from '../hooks/use-cash-closings';
import { differenceClassName } from '../lib/difference-class-name';
import type { CashClosing } from '../types';

const DEFAULT_LIMIT = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

const SKELETON_ROWS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'] as const;

function TableSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando cierres de caja"
      className="block space-y-2"
    >
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="h-10 animate-pulse rounded-md bg-muted" />
      ))}
    </output>
  );
}

function CashClosingRow({ closing }: { closing: CashClosing }) {
  const navigate = useNavigate();

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users navigate via the real link in the date cell; the row onClick is a pointer-only convenience.
    <tr
      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
      onClick={() => navigate(`/cash-closings/${closing.id}`)}
    >
      <td className="p-4 font-medium text-foreground">
        {/* Real link for keyboard/AT users; the row onClick only serves
            pointer users. stopPropagation avoids a double navigation when
            the link itself is clicked. */}
        <Link
          to={`/cash-closings/${closing.id}`}
          onClick={(event) => event.stopPropagation()}
          className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {formatDate(closing.periodEnd)}
        </Link>
      </td>
      <td className="p-4 text-muted-foreground">{closing.closedBy.name}</td>
      <td className="p-4 text-muted-foreground">{closing.salesCount}</td>
      {/* Money renders verbatim as decimal strings — no recomputation
          (list precedent). */}
      <td className="p-4 text-muted-foreground">{closing.expectedCash}</td>
      <td className="p-4 text-muted-foreground">{closing.declaredCash}</td>
      <td
        className={cn(
          'p-4 font-medium',
          differenceClassName(closing.difference)
        )}
      >
        {closing.difference}
      </td>
    </tr>
  );
}

function CashClosingsTable({ cashClosings }: { cashClosings: CashClosing[] }) {
  if (cashClosings.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Todavía no hay cierres.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha de cierre
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cerrado por
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Ventas
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Efectivo esperado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Efectivo declarado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Diferencia
            </th>
          </tr>
        </thead>
        <tbody>
          {cashClosings.map((closing) => (
            <CashClosingRow key={closing.id} closing={closing} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CashClosingsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const { cashClosings, meta, isLoading, error } = useCashClosings({
    page,
    limit: DEFAULT_LIMIT,
  });

  function handlePageChange(nextPage: number) {
    setSearchParams({ page: nextPage.toString() }, { replace: true });
  }

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Cierres de caja</PageTitle>
        <Link
          to="/cash-closings/close"
          className={cn(
            'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <IconCashRegister className="mr-1.5 h-3.5 w-3.5" />
          Cerrar caja
        </Link>
      </PageHeader>
      <PageContent>
        <SectionCard title="Historial de cierres">
          <div className="space-y-4">
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudieron cargar los cierres de caja. Intentá de nuevo más
                tarde.
              </div>
            ) : (
              <CashClosingsTable cashClosings={cashClosings} />
            )}
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={handlePageChange} />
            )}
          </div>
        </SectionCard>
      </PageContent>
    </>
  );
}

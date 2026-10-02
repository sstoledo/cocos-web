import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCashClosing } from '../hooks/use-cash-closing';
import { differenceClassName } from '../lib/difference-class-name';
import type { CashClosing } from '../types';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function CashClosingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: closing, isLoading, error } = useCashClosing(id ?? '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // jsPDF is heavy, so the report module loads on demand on first click.
  async function handleDownloadPdf(current: CashClosing) {
    setIsGeneratingPdf(true);
    try {
      const { generateCashClosingPdf } = await import(
        '../lib/cash-closing-pdf'
      );
      generateCashClosingPdf(current);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando cierre de caja…
      </output>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>El cierre de caja no existe o fue eliminado.</p>
          <Link to="/cash-closings" className="text-primary underline">
            Volver a cierres de caja
          </Link>
        </div>
      </div>
    );
  }

  if (error || !closing) {
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
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Detalle de cierre</PageTitle>
        <Button
          type="button"
          variant="outline"
          disabled={isGeneratingPdf}
          onClick={() => handleDownloadPdf(closing)}
        >
          <IconFileTypePdf className="mr-1.5 h-3.5 w-3.5" />
          Descargar PDF
        </Button>
      </PageHeader>
      <PageContent>
        <SectionCard title="Período">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Inicio del período
              </dt>
              <dd className="text-foreground">
                {formatDateTime(closing.periodStart)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Fin del período</dt>
              <dd className="text-foreground">
                {formatDateTime(closing.periodEnd)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Registrado</dt>
              <dd className="text-foreground">
                {formatDateTime(closing.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Cerrado por</dt>
              <dd className="text-foreground">{closing.closedBy.name}</dd>
            </div>
          </dl>
        </SectionCard>
        <SectionCard title="Montos">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                Efectivo esperado
              </dt>
              <dd className="text-foreground">{closing.expectedCash}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Tarjeta esperada
              </dt>
              <dd className="text-foreground">{closing.expectedCard}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Transferencia esperada
              </dt>
              <dd className="text-foreground">{closing.expectedTransfer}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Efectivo declarado
              </dt>
              <dd className="text-foreground">{closing.declaredCash}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Diferencia</dt>
              <dd
                className={cn(
                  'font-semibold',
                  differenceClassName(closing.difference)
                )}
              >
                {closing.difference}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Ventas</dt>
              <dd className="text-foreground">{closing.salesCount}</dd>
            </div>
            <div className="sm:col-span-3">
              <dt className="text-sm text-muted-foreground">Notas</dt>
              <dd className="text-foreground">{closing.notes ?? '—'}</dd>
            </div>
          </dl>
        </SectionCard>
      </PageContent>
    </>
  );
}

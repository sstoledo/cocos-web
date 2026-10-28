import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { IconArrowLeft, IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ConvertProformaAction } from '../components/ConvertProformaAction';
import { ProformaStatusBadge } from '../components/ProformaStatusBadge';
import { useProforma } from '../hooks/use-proforma';
import type { Proforma, ProformaProductLine } from '../types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR');
}

function ProformaLinesTable({
  lines,
  entityLabel,
  emptyMessage,
}: {
  lines: ProformaProductLine[];
  entityLabel: string;
  emptyMessage: string;
}) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-caption">
          <thead className="bg-muted">
            <tr className="text-left font-semibold text-muted-foreground">
              <th className="px-3 py-2">{entityLabel}</th>
              <th className="px-3 py-2 text-center">Cantidad</th>
              <th className="px-3 py-2 text-right">Precio unitario</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr
                key={line.id}
                className="h-12 border-b border-border last:border-0"
              >
                <td className="px-3">
                  <p className="font-medium text-foreground">
                    {line.product.name}
                  </p>
                  <p className="text-muted-foreground">{line.product.code}</p>
                </td>
                <td className="px-3 text-center font-mono">{line.quantity}</td>
                <td className="px-3 text-right font-mono">
                  {line.unitPriceSnapshot}
                </td>
                <td className="px-3 text-right font-mono font-medium">
                  {line.subtotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {lines.map((line) => (
          <article
            key={line.id}
            data-testid="proforma-line-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div>
              <p className="font-medium text-foreground">{line.product.name}</p>
              <p className="text-caption text-muted-foreground">
                {line.product.code}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-caption">
              <div>
                <dt className="text-muted-foreground">Cantidad</dt>
                <dd className="font-mono text-foreground">{line.quantity}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio unitario</dt>
                <dd className="font-mono text-foreground">
                  {line.unitPriceSnapshot}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono font-medium text-foreground">
                  {line.subtotal}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

export function ProformaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: proforma, isLoading, error } = useProforma(id ?? '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // jsPDF is heavy, so the report module loads on demand on first click.
  async function handleDownloadPdf(current: Proforma) {
    setIsGeneratingPdf(true);
    try {
      const { generateProformaPdf } = await import('../lib/proforma-pdf');
      generateProformaPdf(current);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando proforma…
      </output>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
          <p>La proforma no existe o fue eliminada.</p>
          <Link to="/proformas" className="text-primary underline">
            Volver a proformas
          </Link>
        </div>
      </div>
    );
  }

  if (error || !proforma) {
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
      <PageHeader className="flex items-center gap-3">
        <Link
          to="/proformas"
          aria-label="Volver a proformas"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <PageTitle className="text-h3 lg:text-h2">
            <span className="lg:hidden">Proforma</span>
            <span className="hidden lg:inline">
              Proforma {proforma.proformaNumber}
            </span>
          </PageTitle>
          <p className="text-sm text-muted-foreground lg:hidden">
            {proforma.proformaNumber}
          </p>
        </div>
        <ProformaStatusBadge status={proforma.status} />
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la proforma">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Cliente</dt>
              <dd className="text-foreground">
                {proforma.client?.name ?? 'Cliente ocasional'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sucursal</dt>
              <dd className="text-foreground">
                {proforma.branch?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Empleado</dt>
              <dd className="text-foreground">
                {proforma.employee?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Fecha</dt>
              <dd className="text-foreground">
                {formatDate(proforma.createdAt)}
              </dd>
            </div>
            {proforma.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Notas</dt>
                <dd className="text-foreground">{proforma.notes}</dd>
              </div>
            )}
            {proforma.convertedSaleId && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  Venta generada
                </dt>
                <dd className="text-foreground">{proforma.convertedSaleId}</dd>
              </div>
            )}
          </dl>
        </SectionCard>
        <SectionCard title="Productos">
          <ProformaLinesTable
            lines={proforma.products}
            entityLabel="Producto"
            emptyMessage="No hay productos cargados."
          />
        </SectionCard>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-stat">
          <span className="text-body-sm font-semibold text-muted-foreground">
            Total:
          </span>
          <span
            data-testid="proforma-total-value"
            className="font-mono text-h3 font-semibold text-foreground"
          >
            {proforma.totalAmount}
          </span>
        </div>
        <div className="flex sm:justify-end">
          <Button
            variant="outline"
            data-testid="proforma-pdf-action"
            disabled={isGeneratingPdf}
            onClick={() => handleDownloadPdf(proforma)}
            className="w-full sm:w-auto"
          >
            <IconFileTypePdf className="mr-1.5 h-4 w-4" />
            {isGeneratingPdf ? 'Generando…' : 'Descargar PDF'}
          </Button>
        </div>
        <ConvertProformaAction proforma={proforma} />
      </PageContent>
    </>
  );
}

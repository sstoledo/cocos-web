import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { ApiError } from '@/lib/api-error';
import { IconFileTypePdf } from '@tabler/icons-react';
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">{entityLabel}</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Precio unitario</th>
            <th className="px-3 py-2 font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-border">
              <td className="px-3 py-2">{line.product.name}</td>
              <td className="px-3 py-2">{line.quantity}</td>
              <td className="px-3 py-2">{line.unitPriceSnapshot}</td>
              <td className="px-3 py-2">{line.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <PageHeader>
        <PageTitle>Proforma {proforma.proformaNumber}</PageTitle>
        <ProformaStatusBadge status={proforma.status} />
        <Button
          variant="outline"
          disabled={isGeneratingPdf}
          onClick={() => handleDownloadPdf(proforma)}
        >
          <IconFileTypePdf className="mr-1.5 h-4 w-4" />
          {isGeneratingPdf ? 'Generando…' : 'Descargar PDF'}
        </Button>
        <ConvertProformaAction proforma={proforma} />
      </PageHeader>
      <PageContent>
        <SectionCard title="Información general">
          <dl className="grid gap-4 sm:grid-cols-2">
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
              <div>
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
        <p className="text-right text-lg font-semibold">
          {`Total: ${proforma.totalAmount}`}
        </p>
      </PageContent>
    </>
  );
}

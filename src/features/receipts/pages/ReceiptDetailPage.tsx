import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { IconArrowLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ReceiptReviewForm } from '../components/ReceiptReviewForm';
import { useReceipt } from '../hooks/use-receipt';
import {
  useDiscardReceipt,
  useRetryReceiptOcr,
} from '../hooks/use-receipt-mutations';
import { getReceiptErrorMessage } from '../lib/receipt-errors';

export function ReceiptDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: receipt, isLoading, error } = useReceipt(id);
  const retryMutation = useRetryReceiptOcr();
  const discardMutation = useDiscardReceipt();
  const [discardOpen, setDiscardOpen] = useState(false);

  if (isLoading) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando comprobante…
      </output>
    );
  }

  if (error || !receipt) {
    return (
      <div className="p-6">
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          No se pudo cargar el comprobante. Intentá nuevamente.
        </div>
        <Link
          to="/receipts"
          className="mt-4 inline-block text-primary underline"
        >
          Volver a comprobantes
        </Link>
      </div>
    );
  }

  const actionError = retryMutation.error ?? discardMutation.error;

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/receipts"
            aria-label="Volver a comprobantes"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
          <PageTitle className="text-h3 lg:text-h2">
            {receipt.fileName}
          </PageTitle>
        </div>
        {receipt.status === 'pending' && (
          <div
            data-testid="receipt-detail-actions"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {!receipt.extracted && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => retryMutation.mutate(receipt.id)}
                disabled={retryMutation.isPending}
              >
                {retryMutation.isPending ? 'Procesando OCR…' : 'Reintentar OCR'}
              </Button>
            )}
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={() => setDiscardOpen(true)}
            >
              Descartar comprobante
            </Button>
          </div>
        )}
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          <SectionCard title="Archivo y extracción">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {receipt.mimeType === 'application/pdf' ? (
                  <a
                    href={receipt.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md border border-border px-4 py-3 text-primary hover:bg-muted"
                  >
                    Abrir PDF en una nueva pestaña
                  </a>
                ) : (
                  <img
                    src={receipt.fileUrl}
                    alt={`Comprobante ${receipt.fileName}`}
                    className="max-h-[32rem] w-full rounded-md border border-border object-contain"
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  Cargado el{' '}
                  {new Date(receipt.createdAt).toLocaleString('es-AR')}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Datos extraídos</h3>
                {receipt.extracted ? (
                  <>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="inline font-medium">Proveedor OCR: </dt>
                        <dd className="inline">
                          {receipt.extracted.supplierName ?? 'No identificado'}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Comprobante: </dt>
                        <dd className="inline">
                          {receipt.extracted.documentNumber ??
                            'No identificado'}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">
                          Fecha de emisión:{' '}
                        </dt>
                        <dd className="inline">
                          {receipt.extracted.issueDate ?? 'No identificada'}
                        </dd>
                      </div>
                    </dl>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {receipt.extracted.items.map((item, index) => (
                        <li key={`${item.description}-${index}`}>
                          {item.description} — Cantidad: {item.quantity} —
                          Precio unitario: {item.unitPrice.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Todavía no hay datos estructurados. Reintentá el OCR antes
                    de confirmar.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {actionError && (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {getReceiptErrorMessage(actionError)}
            </div>
          )}

          {receipt.status === 'pending' ? (
            <SectionCard title="Revisión y confirmación">
              <ReceiptReviewForm key={receipt.updatedAt} receipt={receipt} />
            </SectionCard>
          ) : (
            <SectionCard title="Resultado">
              <div className="space-y-2 text-sm">
                <p>
                  Estado:{' '}
                  <span className="font-medium">
                    {receipt.status === 'confirmed'
                      ? 'Confirmado'
                      : 'Descartado'}
                  </span>
                </p>
                {receipt.lot && (
                  <p>
                    Lote vinculado:{' '}
                    <Link to="/lots" className="text-primary underline">
                      {receipt.lot.lotNumber}
                    </Link>
                  </p>
                )}
                {receipt.purchaseOrder && (
                  <p>
                    Orden vinculada:{' '}
                    <Link
                      to={`/purchase-orders/${receipt.purchaseOrder.id}`}
                      className="text-primary underline"
                    >
                      {receipt.purchaseOrder.purchaseOrderNumber}
                    </Link>
                  </p>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </PageContent>
      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Descartar comprobante"
        description="El comprobante quedará descartado y no registrará inventario."
        confirmLabel="Descartar"
        onConfirm={() =>
          discardMutation.mutate(receipt.id, {
            onSuccess: () => navigate('/receipts'),
          })
        }
      />
    </>
  );
}

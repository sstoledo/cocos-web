import { Button } from '@/components/ui/Button';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ReceiptTable } from '../components/ReceiptTable';
import { ReceiptUpload } from '../components/ReceiptUpload';
import { useReceipts } from '../hooks/use-receipts';
import type { ReceiptStatus } from '../types';

const FILTERS: { label: string; value?: ReceiptStatus }[] = [
  { label: 'Todas' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Descartados', value: 'discarded' },
];

export function ReceiptsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadOpen, setUploadOpen] = useState(false);
  const requestedStatus = searchParams.get('status');
  const status = FILTERS.some((filter) => filter.value === requestedStatus)
    ? (requestedStatus as ReceiptStatus)
    : undefined;
  const { receipts, isLoading, error } = useReceipts(status);

  return (
    <>
      <PageHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle className="text-h3 lg:text-h2">
          Comprobantes de proveedores
        </PageTitle>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setUploadOpen((open) => !open)}
        >
          {uploadOpen ? 'Cerrar carga' : 'Cargar comprobante'}
        </Button>
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          {uploadOpen && (
            <SectionCard title="Nuevo comprobante">
              <ReceiptUpload
                onUploaded={(receipt) => {
                  setUploadOpen(false);
                  navigate(`/receipts/${receipt.id}`);
                }}
              />
            </SectionCard>
          )}
          <SectionCard title="Listado de comprobantes">
            <div className="space-y-4">
              <div
                className="flex flex-wrap gap-2"
                aria-label="Filtrar por estado"
              >
                {FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    aria-pressed={status === filter.value}
                    onClick={() =>
                      setSearchParams(
                        filter.value ? { status: filter.value } : {},
                        { replace: true }
                      )
                    }
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      status === filter.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {isLoading ? (
                <output className="block space-y-3" aria-busy="true">
                  <span className="block text-center text-muted-foreground">
                    Cargando comprobantes…
                  </span>
                  {['first', 'second', 'third'].map((row) => (
                    <span
                      key={row}
                      className="block h-11 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </output>
              ) : error ? (
                <div
                  className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  No se pudieron cargar los comprobantes. Intentá nuevamente.
                </div>
              ) : (
                <ReceiptTable receipts={receipts} />
              )}
            </div>
          </SectionCard>
        </div>
      </PageContent>
    </>
  );
}

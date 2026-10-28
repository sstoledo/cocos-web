import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { useUser } from '@/features/shell/hooks/useUser';
import { ApiError } from '@/lib/api-error';
import { IconAlertCircle, IconArrowsRightLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { useConvertProforma } from '../hooks/use-convert-proforma';
import { getProformaErrorMessage } from '../lib/proforma-error-messages';
import type { Proforma } from '../types';

const CONVERT_ROLES = ['Admin', 'Reception'];

export function ConvertProformaAction({ proforma }: { proforma: Proforma }) {
  const { user } = useUser();
  const convert = useConvertProforma();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'card' | 'transfer'
  >('cash');

  const canConvert =
    proforma.status === 'accepted' &&
    CONVERT_ROLES.includes(user?.role?.name ?? '');

  if (!canConvert) {
    return null;
  }

  function handleConfirm() {
    setErrorMessage(null);
    convert.mutate(
      { id: proforma.id, payload: { paymentMethod } },
      {
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrorMessage(getProformaErrorMessage(error));
          } else {
            setErrorMessage(
              'No se pudo convertir la proforma. Intentá de nuevo más tarde.'
            );
          }
        },
      }
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-primary bg-card p-4">
      <div>
        <h3 className="text-h4 text-foreground">Convertir a venta</h3>
        <p className="text-body-sm font-medium text-warning">
          Confirmación requerida
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-md bg-warning p-3 text-warning-foreground">
        <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-body-sm">
          La conversión es irreversible y consumirá stock FIFO. Verifica los
          productos y confirma el método de pago antes de continuar.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2 sm:w-80">
          <Label htmlFor="convert-payment-method">Método de pago</Label>
          <Select
            id="convert-payment-method"
            aria-label="Método de pago"
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                event.target.value as 'cash' | 'card' | 'transfer'
              )
            }
            options={[
              { value: 'cash', label: 'Efectivo' },
              { value: 'card', label: 'Tarjeta' },
              { value: 'transfer', label: 'Transferencia' },
            ]}
          />
          <p className="text-caption text-muted-foreground">
            Opciones: Efectivo / Tarjeta / Transferencia
          </p>
        </div>
        <Button
          type="button"
          disabled={convert.isPending}
          onClick={() => setConfirmOpen(true)}
          className="w-full sm:w-auto"
        >
          <IconArrowsRightLeft className="mr-1.5 h-4 w-4" />
          Convertir a venta
        </Button>
      </div>
      {errorMessage && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Convertir a venta"
        description={`¿Convertir la proforma ${proforma.proformaNumber} en una venta? Esto registrará el consumo de stock mediante FIFO y no se puede deshacer.`}
        confirmLabel="Convertir"
        variant="danger"
        onConfirm={handleConfirm}
      />
    </section>
  );
}

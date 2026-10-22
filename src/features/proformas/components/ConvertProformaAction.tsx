import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { useUser } from '@/features/shell/hooks/useUser';
import { ApiError } from '@/lib/api-error';
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-2">
        <Label>Método de pago</Label>
        <Select
          value={paymentMethod}
          onChange={(event) =>
            setPaymentMethod(event.target.value as 'cash' | 'card' | 'transfer')
          }
          options={[
            { value: 'cash', label: 'Efectivo' },
            { value: 'card', label: 'Tarjeta' },
            { value: 'transfer', label: 'Transferencia' },
          ]}
        />
        <Button
          type="button"
          variant="outline"
          disabled={convert.isPending}
          onClick={() => setConfirmOpen(true)}
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          Convertir a venta
        </Button>
        {errorMessage && (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Convertir a venta"
        description={`¿Convertir la proforma ${proforma.proformaNumber} en una venta? Esto registrará el consumo de stock mediante FIFO y no se puede deshacer.`}
        confirmLabel="Convertir"
        variant="danger"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

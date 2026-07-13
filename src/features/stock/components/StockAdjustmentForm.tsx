import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useState } from 'react';

export type StockAdjustmentFormProps = {
  onSubmit: (values: { quantity: number; reason?: string }) => void;
  isPending?: boolean;
};

export function StockAdjustmentForm({
  onSubmit,
  isPending = false,
}: StockAdjustmentFormProps) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setQuantityError(null);

    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedQuantity) || quantity.trim() === '') {
      setQuantityError('La cantidad debe ser un número válido.');
      return;
    }

    onSubmit({
      quantity: parsedQuantity,
      reason: reason.trim() || undefined,
    });

    setQuantity('');
    setReason('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          step="1"
          placeholder="Ej: 10 o -2"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          aria-invalid={quantityError ? 'true' : 'false'}
        />
        {quantityError && (
          <p className="text-sm text-destructive" role="alert">
            {quantityError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Motivo</Label>
        <Textarea
          id="reason"
          placeholder="Motivo del ajuste"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Guardar ajuste'}
      </Button>
    </form>
  );
}

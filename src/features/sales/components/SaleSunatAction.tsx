import { Button } from '@/components/ui/Button';
import { useUser } from '@/features/shell/hooks/useUser';
import { ApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useEmitSale } from '../hooks/use-emit-sale';
import type { Sale } from '../types';

const EMIT_ROLES = ['Admin', 'Reception'];

/**
 * SUNAT emission action for a completed, not-yet-emitted sale. Shows the CDR
 * result inline (accepted or rejected with SUNAT's description) so the user
 * can act on rejections without leaving the page.
 */
export function SaleSunatAction({
  sale,
  className,
}: {
  sale: Sale;
  className?: string;
}) {
  const { user } = useUser();
  const emit = useEmitSale();
  const [result, setResult] = useState<{
    sunatStatus: 'accepted' | 'rejected';
    description: string | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canEmit =
    sale.status === 'completed' &&
    sale.sunatStatus === 'pending' &&
    EMIT_ROLES.includes(user?.role?.name ?? '');

  if (!canEmit) {
    return null;
  }

  function handleEmit() {
    setErrorMessage(null);
    emit.mutate(sale.id, {
      onSuccess: (emission) => {
        setResult({
          sunatStatus: emission.sunatStatus,
          description: emission.description,
        });
      },
      onError: (error) => {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'No se pudo emitir el comprobante. Intentá de nuevo.'
        );
      },
    });
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button type="button" disabled={emit.isPending} onClick={handleEmit}>
        {emit.isPending ? 'Emitiendo a SUNAT…' : 'Emitir comprobante'}
      </Button>

      {errorMessage && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {result && (
        <output
          className={cn(
            'block rounded-md px-3 py-2 text-sm',
            result.sunatStatus === 'accepted'
              ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border border-destructive/50 bg-destructive/10 text-destructive'
          )}
        >
          <p className="font-medium">
            {result.sunatStatus === 'accepted'
              ? 'Comprobante aceptado por SUNAT'
              : 'Comprobante rechazado por SUNAT'}
          </p>
          {result.description && <p>{result.description}</p>}
        </output>
      )}
    </div>
  );
}

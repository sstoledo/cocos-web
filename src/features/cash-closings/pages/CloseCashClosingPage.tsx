import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { useClosingPreview } from '../hooks/use-closing-preview';
import { useCreateCashClosing } from '../hooks/use-create-cash-closing';
import { getCashClosingErrorMessage } from '../lib/cash-closing-error-messages';
import { differenceClassName } from '../lib/difference-class-name';
import {
  type CloseCashClosingFormValues,
  closeCashClosingSchema,
} from '../schemas/cash-closing-schema';
import type { CashClosing } from '../types';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

const SKELETON_CELLS = ['cash', 'card', 'transfer', 'sales'] as const;

function PreviewSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando vista previa"
      className="block"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKELETON_CELLS.map((cell) => (
          <div key={cell} className="h-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    </output>
  );
}

function ClosingResult({ closing }: { closing: CashClosing }) {
  return (
    // output carries the implicit status role (polite announcement).
    <output className="block space-y-4">
      <div className="rounded-md border border-border bg-muted/50 p-4 text-foreground">
        <p className="font-medium">Cierre registrado correctamente.</p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Efectivo esperado</dt>
          <dd className="text-foreground">{closing.expectedCash}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Efectivo declarado</dt>
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
      </dl>
      <Link
        to={`/cash-closings/${closing.id}`}
        className="text-primary underline"
      >
        Ver detalle del cierre
      </Link>
    </output>
  );
}

type CloseFormProps = {
  isPending: boolean;
  error: unknown;
  onSubmit: (values: CloseCashClosingFormValues) => void;
};

function CloseForm({ isPending, error, onSubmit }: CloseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CloseCashClosingFormValues>({
    resolver: zodResolver(closeCashClosingSchema),
    defaultValues: { declaredCash: '', notes: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error != null && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {getCashClosingErrorMessage(error)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="declaredCash">Efectivo declarado</Label>
        {/* Text input (not type=number): the decimal string must reach the
            backend verbatim — number inputs normalize '50.00' to '50'
            (B10 lesson, F10.5 precedent). */}
        <Input
          id="declaredCash"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={errors.declaredCash ? 'true' : 'false'}
          {...register('declaredCash')}
        />
        {errors.declaredCash && (
          <p className="text-sm text-destructive" role="alert">
            {errors.declaredCash.message}
          </p>
        )}
      </div>

      <Textarea
        label="Notas (opcional)"
        id="closing-notes"
        {...register('notes')}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Cerrando…' : 'Cerrar caja'}
      </Button>
    </form>
  );
}

export function CloseCashClosingPage() {
  const previewQuery = useClosingPreview();
  const createMutation = useCreateCashClosing();
  const closing = createMutation.data;
  const preview = previewQuery.data;

  function handleSubmit(values: CloseCashClosingFormValues) {
    const notes = values.notes?.trim();
    createMutation.mutate({
      declaredCash: values.declaredCash,
      ...(notes ? { notes } : {}),
    });
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Cierre de caja</PageTitle>
      </PageHeader>
      <PageContent>
        {!closing && (
          <SectionCard title="Período abierto">
            {previewQuery.isLoading ? (
              <PreviewSkeleton />
            ) : previewQuery.error || !preview ? (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                No se pudo cargar la vista previa. Intentá de nuevo más tarde.
              </div>
            ) : (
              <div className="space-y-4">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Efectivo esperado
                    </dt>
                    <dd className="text-foreground">{preview.expectedCash}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Tarjeta esperada
                    </dt>
                    <dd className="text-foreground">{preview.expectedCard}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Transferencia esperada
                    </dt>
                    <dd className="text-foreground">
                      {preview.expectedTransfer}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Ventas</dt>
                    <dd className="text-foreground">{preview.salesCount}</dd>
                  </div>
                </dl>
                <p className="text-sm text-muted-foreground">
                  Desde:{' '}
                  <span className="text-foreground">
                    {preview.periodStart
                      ? formatDateTime(preview.periodStart)
                      : 'Sin cierres previos'}
                  </span>
                </p>
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Cerrar caja">
          {closing ? (
            <ClosingResult closing={closing} />
          ) : (
            <CloseForm
              isPending={createMutation.isPending}
              error={createMutation.error}
              onSubmit={handleSubmit}
            />
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

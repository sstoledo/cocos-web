import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useProducts } from '@/features/products/hooks/use-products';
import { useServices } from '@/features/services/hooks/use-services';
import { formatCents } from '@/lib/cents';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { type SaleFormValues, saleSchema } from '../schemas/sale-schema';
import { PAYMENT_METHOD_LABELS } from './PaymentMethodBadge';
import {
  ProductLinesFieldArray,
  ServiceLinesFieldArray,
  lineSubtotalCents,
} from './SalesLineItems';

export type CheckoutFormProps = {
  onSubmit: (values: SaleFormValues) => void;
  isPending?: boolean;
};

const PAYMENT_METHOD_OPTIONS = (
  Object.entries(PAYMENT_METHOD_LABELS) as Array<
    [keyof typeof PAYMENT_METHOD_LABELS, string]
  >
).map(([value, label]) => ({ value, label }));

export function CheckoutForm({
  onSubmit,
  isPending = false,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: '',
      paymentMethod: '' as SaleFormValues['paymentMethod'],
      productLines: [],
      serviceLines: [],
    },
  });

  const productLines = useWatch({ control, name: 'productLines' });
  const serviceLines = useWatch({ control, name: 'serviceLines' });

  const { clients, isLoading: isLoadingClients } = useClients({});
  const { products, isLoading: isLoadingProducts } = useProducts({});
  const { services, isLoading: isLoadingServices } = useServices({});

  const totalCents =
    (productLines ?? []).reduce(
      (sum, line) =>
        sum +
        (lineSubtotalCents(
          line,
          products.find((product) => product.id === line.productId)?.price
        ) ?? 0),
      0
    ) +
    (serviceLines ?? []).reduce(
      (sum, line) =>
        sum +
        (lineSubtotalCents(
          line,
          services.find((service) => service.id === line.serviceId)?.price
        ) ?? 0),
      0
    );

  // The ≥1-line refine reports on `productLines`; both refine paths surface
  // here as array-level messages.
  const linesError =
    (errors.productLines as { message?: string } | undefined)?.message ??
    (errors.serviceLines as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de pago</Label>
          <Select
            id="paymentMethod"
            options={PAYMENT_METHOD_OPTIONS}
            placeholder="Seleccionar método de pago"
            error={errors.paymentMethod?.message}
            {...register('paymentMethod')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente</Label>
          <Select
            id="clientId"
            optional
            options={clients.map((client) => ({
              value: client.id,
              label: client.name,
            }))}
            placeholder={isLoadingClients ? 'Cargando…' : 'Cliente ocasional'}
            disabled={isLoadingClients}
            error={errors.clientId?.message}
            {...register('clientId')}
          />
          <p className="text-sm text-muted-foreground">
            Dejalo vacío para una venta de mostrador.
          </p>
        </div>
      </div>

      <ServiceLinesFieldArray
        services={services}
        isLoading={isLoadingServices}
        control={control}
        register={register}
      />

      <ProductLinesFieldArray
        products={products}
        isLoading={isLoadingProducts}
        control={control}
        register={register}
      />

      {linesError && (
        <p className="text-sm text-destructive" role="alert">
          {linesError}
        </p>
      )}

      <p className="text-lg font-semibold">Total: {formatCents(totalCents)}</p>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registrando…' : 'Registrar venta'}
        </Button>
        <Link
          to="/sales"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md px-4 font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

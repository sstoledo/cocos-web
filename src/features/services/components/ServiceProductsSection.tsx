import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionCard } from '@/components/ui/SectionCard';
import { ProductCombobox } from '@/features/products/components/ProductCombobox';
import type { Product } from '@/features/products/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddServiceProduct } from '../hooks/use-add-service-product';
import { useRemoveServiceProduct } from '../hooks/use-remove-service-product';
import { useServiceProducts } from '../hooks/use-service-products';
import { useUpdateServiceProduct } from '../hooks/use-update-service-product';
import { getServiceProductErrorMessage } from '../lib/service-product-error-messages';
import {
  type ServiceProductFormValues,
  serviceProductSchema,
} from '../schemas/service-product-schema';
import type { ServiceProduct } from '../types';

type ServiceProductAddFormProps = {
  serviceId: string;
  existingProductIds: Set<string>;
  onError: (error: unknown) => void;
};

function ServiceProductAddForm({
  serviceId,
  existingProductIds,
  onError,
}: ServiceProductAddFormProps) {
  const addServiceProduct = useAddServiceProduct(serviceId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceProductFormValues>({
    resolver: zodResolver(serviceProductSchema),
    defaultValues: { productId: '', quantity: undefined },
  });

  function handleAdd(values: ServiceProductFormValues) {
    addServiceProduct.mutate(
      { productId: values.productId, quantity: values.quantity },
      {
        onSuccess: () => {
          reset({ productId: '', quantity: undefined });
          setSelectedProduct(null);
          onError(null);
        },
        onError,
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleAdd)}
      className="flex flex-wrap items-end gap-3"
      noValidate
    >
      <div className="min-w-56 flex-1">
        <ProductCombobox
          id="service-product"
          label="Producto"
          withCode
          isActive
          excludeIds={existingProductIds}
          value={selectedProduct}
          onChange={(product) => {
            setSelectedProduct(product);
            setValue('productId', product?.id ?? '', {
              shouldValidate: true,
            });
          }}
          error={errors.productId?.message}
        />
      </div>
      <div className="w-28 space-y-2">
        <label
          htmlFor="service-product-quantity"
          className="block text-sm font-medium text-foreground"
        >
          Cantidad
        </label>
        <Input
          id="service-product-quantity"
          type="number"
          min="1"
          step="1"
          aria-invalid={errors.quantity ? 'true' : 'false'}
          {...register('quantity')}
        />
        {errors.quantity && (
          <p className="text-sm text-destructive" role="alert">
            {errors.quantity.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={addServiceProduct.isPending}>
        {addServiceProduct.isPending ? 'Agregando…' : 'Agregar producto'}
      </Button>
    </form>
  );
}

type ServiceProductRowProps = {
  serviceProduct: ServiceProduct;
  canManage: boolean;
};

function ServiceProductRow({
  serviceProduct,
  canManage,
}: ServiceProductRowProps) {
  const updateServiceProduct = useUpdateServiceProduct(
    serviceProduct.serviceId
  );
  const removeServiceProduct = useRemoveServiceProduct(
    serviceProduct.serviceId
  );
  const [quantity, setQuantity] = useState(String(serviceProduct.quantity));
  const [rowError, setRowError] = useState<unknown>(null);

  const parsedQuantity = Number(quantity);
  const isValidQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0;
  const isDirty = parsedQuantity !== serviceProduct.quantity;

  function handleUpdate() {
    if (!isValidQuantity) {
      return;
    }
    updateServiceProduct.mutate(
      { productId: serviceProduct.productId, quantity: parsedQuantity },
      { onError: setRowError }
    );
  }

  function handleRemove() {
    removeServiceProduct.mutate(serviceProduct.productId, {
      onError: setRowError,
    });
  }

  return (
    <tr className="border-b border-border">
      <td className="px-3 py-2">
        {serviceProduct.product.code} — {serviceProduct.product.name}
      </td>
      <td className="px-3 py-2">
        {canManage ? (
          <Input
            aria-label={`Cantidad de ${serviceProduct.product.name}`}
            type="number"
            min="1"
            step="1"
            className="w-24"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        ) : (
          serviceProduct.quantity
        )}
      </td>
      {canManage && (
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpdate}
              disabled={
                updateServiceProduct.isPending || !isValidQuantity || !isDirty
              }
            >
              Actualizar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={removeServiceProduct.isPending}
              className="text-destructive hover:bg-destructive/10"
            >
              Quitar
            </Button>
          </div>
          {rowError != null && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {getServiceProductErrorMessage(rowError)}
            </p>
          )}
        </td>
      )}
    </tr>
  );
}

export type ServiceProductsSectionProps = {
  serviceId: string;
  canManage: boolean;
};

export function ServiceProductsSection({
  serviceId,
  canManage,
}: ServiceProductsSectionProps) {
  const serviceProductsQuery = useServiceProducts(serviceId);
  const [formError, setFormError] = useState<unknown>(null);

  const serviceProducts = Array.isArray(serviceProductsQuery.data)
    ? serviceProductsQuery.data
    : [];

  return (
    <SectionCard title="Productos que consume">
      <div className="space-y-4">
        {serviceProductsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando receta…</p>
        ) : serviceProductsQuery.error ? (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            role="alert"
          >
            No se pudo cargar la receta. Intentá de nuevo más tarde.
          </div>
        ) : serviceProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 font-medium">Cantidad</th>
                  {canManage && <th className="px-3 py-2 font-medium" />}
                </tr>
              </thead>
              <tbody>
                {serviceProducts.map((serviceProduct) => (
                  <ServiceProductRow
                    key={serviceProduct.id}
                    serviceProduct={serviceProduct}
                    canManage={canManage}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este servicio no tiene productos asociados.
          </p>
        )}

        {canManage && (
          <>
            {formError != null && (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                role="alert"
              >
                {getServiceProductErrorMessage(formError)}
              </div>
            )}
            <ServiceProductAddForm
              serviceId={serviceId}
              existingProductIds={
                new Set(serviceProducts.map((item) => item.productId))
              }
              onError={setFormError}
            />
          </>
        )}
      </div>
    </SectionCard>
  );
}

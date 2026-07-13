import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { productSchema } from '../schemas/product-schema';
import type { ProductFormValues, ProductReference } from '../types';
import { ProductImageUpload } from './ProductImageUpload';

export type ProductFormProps = {
  onSubmit: (values: ProductFormValues, image: File | null) => void;
  presentations: ProductReference[];
  brands: ProductReference[];
  categories: ProductReference[];
  isPending?: boolean;
};

function toSelectOptions(references: ProductReference[]) {
  return references.map((reference) => ({
    value: reference.id,
    label: reference.name,
  }));
}

export function ProductForm({
  onSubmit,
  presentations,
  brands,
  categories,
  isPending = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      price: undefined,
      presentationId: '',
      brandId: '',
      categoryId: '',
      barcode: '',
      taxRate: undefined,
      notes: '',
      isActive: true,
    },
  });
  const [image, setImage] = useState<File | null>(null);

  function handleFormSubmit(values: ProductFormValues) {
    onSubmit(values, image);
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            type="text"
            placeholder="Código del producto"
            aria-invalid={errors.code ? 'true' : 'false'}
            {...register('code')}
          />
          {errors.code && (
            <p className="text-sm text-destructive" role="alert">
              {errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            type="text"
            placeholder="Nombre del producto"
            aria-invalid={errors.name ? 'true' : 'false'}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Descripción del producto"
          {...register('description')}
        />
      </div>

      <ProductImageUpload onChange={setImage} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            aria-invalid={errors.price ? 'true' : 'false'}
            {...register('price')}
          />
          {errors.price && (
            <p className="text-sm text-destructive" role="alert">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Código de barras</Label>
          <Input
            id="barcode"
            type="text"
            placeholder="Código de barras"
            {...register('barcode')}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="presentationId">Presentación</Label>
          <Select
            id="presentationId"
            options={toSelectOptions(presentations)}
            placeholder="Seleccionar presentación"
            aria-invalid={errors.presentationId ? 'true' : 'false'}
            error={errors.presentationId?.message}
            {...register('presentationId')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandId">Marca</Label>
          <Select
            id="brandId"
            options={toSelectOptions(brands)}
            placeholder="Seleccionar marca"
            aria-invalid={errors.brandId ? 'true' : 'false'}
            error={errors.brandId?.message}
            {...register('brandId')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <Select
            id="categoryId"
            options={toSelectOptions(categories)}
            placeholder="Seleccionar categoría"
            aria-invalid={errors.categoryId ? 'true' : 'false'}
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="taxRate">Tasa de impuesto (%)</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            aria-invalid={errors.taxRate ? 'true' : 'false'}
            {...register('taxRate')}
          />
          {errors.taxRate && (
            <p className="text-sm text-destructive" role="alert">
              {errors.taxRate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              id="isActive"
              label="Activo"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creando…' : 'Crear producto'}
        </Button>
        <Link
          to="/products"
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

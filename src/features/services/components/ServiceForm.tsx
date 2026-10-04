import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { serviceSchema } from '../schemas/service-schema';
import type { ServiceFormValues } from '../types';

export type ServiceFormProps = {
  onSubmit: (values: ServiceFormValues) => void;
  isPending?: boolean;
  initialValues?: ServiceFormValues;
};

export function ServiceForm({
  onSubmit,
  isPending = false,
  initialValues,
}: ServiceFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialValues ?? {
      code: '',
      name: '',
      description: '',
      price: undefined,
      estimatedDuration: undefined,
      isActive: true,
    },
  });

  function handleFormSubmit(values: ServiceFormValues) {
    onSubmit(values);
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
            placeholder="Código del servicio"
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
            placeholder="Nombre del servicio"
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
          placeholder="Descripción del servicio"
          {...register('description')}
        />
      </div>

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
          <Label htmlFor="estimatedDuration">Duración estimada (minutos)</Label>
          <Input
            id="estimatedDuration"
            type="number"
            step="1"
            min="1"
            placeholder="Ej: 30"
            aria-invalid={errors.estimatedDuration ? 'true' : 'false'}
            {...register('estimatedDuration')}
          />
          {errors.estimatedDuration && (
            <p className="text-sm text-destructive" role="alert">
              {errors.estimatedDuration.message}
            </p>
          )}
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
          {isPending
            ? isEditMode
              ? 'Guardando…'
              : 'Creando…'
            : isEditMode
              ? 'Guardar cambios'
              : 'Crear servicio'}
        </Button>
        <Link
          to="/services"
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

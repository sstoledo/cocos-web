import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { supplierSchema } from '../schemas/supplier-schema';
import type { SupplierFormValues } from '../types';

export type SupplierFormProps = {
  onSubmit: (values: SupplierFormValues) => void;
  isPending?: boolean;
  initialValues?: SupplierFormValues;
};

export function SupplierForm({
  onSubmit,
  isPending = false,
  initialValues,
}: SupplierFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialValues ?? {
      name: '',
      phone: '',
      email: '',
      address: '',
      isActive: true,
    },
  });

  function handleFormSubmit(values: SupplierFormValues) {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          placeholder="Nombre del proveedor"
          aria-invalid={errors.name ? 'true' : 'false'}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Teléfono"
            aria-invalid={errors.phone ? 'true' : 'false'}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-destructive" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            aria-invalid={errors.email ? 'true' : 'false'}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          placeholder="Dirección del proveedor"
          aria-invalid={errors.address ? 'true' : 'false'}
          {...register('address')}
        />
        {errors.address && (
          <p className="text-sm text-destructive" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Estado</Label>
        <Switch
          id="isActive"
          label="Activo"
          checked={initialValues?.isActive ?? true}
          {...register('isActive')}
        />
        {errors.isActive && (
          <p className="text-sm text-destructive" role="alert">
            {errors.isActive.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditMode
              ? 'Guardando…'
              : 'Creando…'
            : isEditMode
              ? 'Guardar cambios'
              : 'Crear proveedor'}
        </Button>
        <Link
          to="/suppliers"
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

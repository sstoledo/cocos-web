import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { brandSchema } from '../schemas/brand-schema';
import type { BrandFormValues } from '../types';

export type BrandFormProps = {
  onSubmit: (values: BrandFormValues) => void;
  isPending?: boolean;
  initialValues?: BrandFormValues;
};

export function BrandForm({
  onSubmit,
  isPending = false,
  initialValues,
}: BrandFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialValues ?? {
      name: '',
    },
  });

  function handleFormSubmit(values: BrandFormValues) {
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
          placeholder="Nombre de la marca"
          aria-invalid={errors.name ? 'true' : 'false'}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
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
              : 'Crear marca'}
        </Button>
        <Link
          to="/brands"
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

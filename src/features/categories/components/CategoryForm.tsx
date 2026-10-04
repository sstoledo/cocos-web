import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { categorySchema } from '../schemas/category-schema';
import type { Category, CategoryFormValues } from '../types';

export type CategoryFormProps = {
  onSubmit: (values: CategoryFormValues) => void;
  isPending?: boolean;
  initialValues?: CategoryFormValues;
  categories?: Category[];
  currentCategoryId?: string;
};

export function CategoryForm({
  onSubmit,
  isPending = false,
  initialValues,
  categories = [],
  currentCategoryId,
}: CategoryFormProps) {
  const isEditMode = Boolean(initialValues);

  // Filter out current category from parent options (to prevent self-reference)
  const parentOptions = categories
    .filter((c) => c.id !== currentCategoryId)
    .map((c) => ({ value: c.id, label: c.name }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues ?? {
      name: '',
      parentId: null,
    },
  });

  function handleFormSubmit(values: CategoryFormValues) {
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
          placeholder="Nombre de la categoría"
          aria-invalid={errors.name ? 'true' : 'false'}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Categoría padre (opcional)</Label>
        <Select
          id="parentId"
          options={parentOptions}
          placeholder="Sin categoría padre"
          optional
          error={errors.parentId?.message}
          {...register('parentId')}
        />
        {errors.parentId && (
          <p className="text-sm text-destructive" role="alert">
            {errors.parentId.message}
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
              : 'Crear categoría'}
        </Button>
        <Link
          to="/categories"
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

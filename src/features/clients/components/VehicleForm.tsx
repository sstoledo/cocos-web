import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { vehicleSchema } from '../schemas/vehicle-schema';
import type { VehicleFormValues } from '../types';

export type VehicleFormProps = {
  onSubmit: (values: VehicleFormValues) => void;
  isPending?: boolean;
  initialValues?: VehicleFormValues;
  onCancel?: () => void;
  clientId: string;
};

export function VehicleForm({
  onSubmit,
  isPending = false,
  initialValues,
  onCancel,
  clientId,
}: VehicleFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialValues ?? {
      plate: '',
      brand: '',
      model: '',
      year: undefined,
      color: '',
      notes: '',
      clientId,
    },
  });

  function handleFormSubmit(values: VehicleFormValues) {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <input type="hidden" {...register('clientId')} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa</Label>
          <Input
            id="plate"
            type="text"
            placeholder="ABC-123"
            aria-invalid={errors.plate ? 'true' : 'false'}
            {...register('plate')}
          />
          {errors.plate && (
            <p className="text-sm text-destructive" role="alert">
              {errors.plate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            type="text"
            placeholder="Toyota"
            aria-invalid={errors.brand ? 'true' : 'false'}
            {...register('brand')}
          />
          {errors.brand && (
            <p className="text-sm text-destructive" role="alert">
              {errors.brand.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            type="text"
            placeholder="Corolla"
            aria-invalid={errors.model ? 'true' : 'false'}
            {...register('model')}
          />
          {errors.model && (
            <p className="text-sm text-destructive" role="alert">
              {errors.model.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            type="text"
            placeholder="2020"
            aria-invalid={errors.year ? 'true' : 'false'}
            {...register('year')}
          />
          {errors.year && (
            <p className="text-sm text-destructive" role="alert">
              {errors.year.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="text"
            placeholder="Rojo"
            {...register('color')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas del vehículo"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditMode
              ? 'Guardando…'
              : 'Creando…'
            : isEditMode
              ? 'Guardar cambios'
              : 'Crear vehículo'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

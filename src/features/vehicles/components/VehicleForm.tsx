import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { vehicleSchema } from '../schemas/vehicle-schema';
import type { ClientSelectOption, VehicleFormValues } from '../types';

export type VehicleFormProps = {
  onSubmit: (values: VehicleFormValues) => void;
  clients: ClientSelectOption[];
  isPending?: boolean;
  initialValues?: VehicleFormValues;
};

function toSelectOptions(clients: ClientSelectOption[]) {
  return clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));
}

export function VehicleForm({
  onSubmit,
  clients,
  isPending = false,
  initialValues,
}: VehicleFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    control,
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
      clientId: '',
      isActive: true,
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
            placeholder="Marca del vehículo"
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
            placeholder="Modelo del vehículo"
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
            type="number"
            step="1"
            min="1900"
            placeholder="Ej: 2020"
            aria-invalid={errors.year ? 'true' : 'false'}
            {...register('year', { valueAsNumber: true })}
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
            placeholder="Color del vehículo"
            {...register('color')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente</Label>
          <Select
            id="clientId"
            options={toSelectOptions(clients)}
            placeholder="Seleccionar cliente"
            aria-invalid={errors.clientId ? 'true' : 'false'}
            error={errors.clientId?.message}
            {...register('clientId')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Notas adicionales"
          {...register('notes')}
        />
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
              : 'Crear vehículo'}
        </Button>
        <Link
          to="/vehicles"
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

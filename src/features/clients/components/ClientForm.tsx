import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useRucLookup } from '@/features/clients/hooks/use-ruc-lookup';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { clientSchema } from '../schemas/client-schema';
import type { ClientFormValues } from '../types';

export type ClientFormProps = {
  onSubmit: (values: ClientFormValues) => void;
  isPending?: boolean;
  initialValues?: ClientFormValues;
};

const identificationTypeOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
];

export function ClientForm({
  onSubmit,
  isPending = false,
  initialValues,
}: ClientFormProps) {
  const isEditMode = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues ?? {
      name: '',
      identificationType: 'DNI',
      identification: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const identificationType = watch('identificationType');
  const identification = watch('identification');
  const rucLookup = useRucLookup(
    identificationType ?? '',
    identification ?? ''
  );

  // Autofill only empty fields: never clobber what the user typed.
  useEffect(() => {
    if (rucLookup.status !== 'found') {
      return;
    }
    if (!getValues('name')) {
      setValue('name', rucLookup.result.razonSocial);
    }
    if (!getValues('address') && rucLookup.result.direccion) {
      setValue('address', rucLookup.result.direccion);
    }
  }, [rucLookup, getValues, setValue]);

  function handleFormSubmit(values: ClientFormValues) {
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
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            type="text"
            placeholder="Nombre del cliente"
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
          <Label htmlFor="identificationType">Tipo de identificación</Label>
          <Select
            id="identificationType"
            options={identificationTypeOptions}
            placeholder="Seleccionar tipo"
            aria-invalid={errors.identificationType ? 'true' : 'false'}
            error={errors.identificationType?.message}
            {...register('identificationType')}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="identification">Identificación</Label>
          <Input
            id="identification"
            type="text"
            placeholder="Número de identificación"
            aria-invalid={errors.identification ? 'true' : 'false'}
            {...register('identification')}
          />
          {errors.identification && (
            <p className="text-sm text-destructive" role="alert">
              {errors.identification.message}
            </p>
          )}
          {rucLookup.status === 'loading' && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Consultando SUNAT…
            </p>
          )}
          {rucLookup.status === 'found' && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              SUNAT: {rucLookup.result.razonSocial}
              {rucLookup.result.estado ? ` · ${rucLookup.result.estado}` : ''}
              {rucLookup.result.condicion
                ? ` · ${rucLookup.result.condicion}`
                : ''}
            </p>
          )}
          {rucLookup.status === 'error' && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {rucLookup.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Teléfono"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea
            id="address"
            placeholder="Dirección del cliente"
            {...register('address')}
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
              : 'Crear cliente'}
        </Button>
        <Link
          to="/clients"
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

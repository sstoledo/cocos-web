import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SectionCard } from '@/components/ui/SectionCard';
import { UbigeoCombobox } from '@/features/ubigeo/components/UbigeoCombobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateCompanySettings } from '../hooks/use-update-company-settings';
import {
  type CompanySettingsFormValues,
  companySettingsSchema,
} from '../schemas/company-settings-schema';
import type { CompanySettings } from '../types';

export function SettingsCompanyForm({
  settings,
}: {
  settings: CompanySettings;
}) {
  const {
    mutate: updateSettings,
    isPending,
    error,
  } = useUpdateCompanySettings();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      ruc: settings.ruc ?? '',
      legalName: settings.legalName ?? '',
      address: settings.address ?? '',
      ubigeo: settings.ubigeo ?? '',
      facturaSeries: settings.facturaSeries,
      boletaSeries: settings.boletaSeries,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => updateSettings(values))}
      className="space-y-4"
      aria-label="Configuración fiscal de la empresa"
    >
      <SectionCard title="Identidad fiscal">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input id="ruc" {...register('ruc')} placeholder="20100070970" />
            {errors.ruc && (
              <p className="text-caption text-destructive">
                {errors.ruc.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalName">Razón social</Label>
            <Input id="legalName" {...register('legalName')} />
            {errors.legalName && (
              <p className="text-caption text-destructive">
                {errors.legalName.message}
              </p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección fiscal</Label>
            <Input id="address" {...register('address')} />
            {errors.address && (
              <p className="text-caption text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Controller
              name="ubigeo"
              control={control}
              render={({ field }) => (
                <UbigeoCombobox
                  id="ubigeo"
                  label="Ubigeo del domicilio fiscal"
                  value={field.value || null}
                  onChange={(code) => field.onChange(code ?? '')}
                  error={errors.ubigeo?.message}
                />
              )}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Series de comprobantes">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facturaSeries">Serie de facturas</Label>
            <Input id="facturaSeries" {...register('facturaSeries')} />
            {errors.facturaSeries && (
              <p className="text-caption text-destructive">
                {errors.facturaSeries.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="boletaSeries">Serie de boletas</Label>
            <Input id="boletaSeries" {...register('boletaSeries')} />
            {errors.boletaSeries && (
              <p className="text-caption text-destructive">
                {errors.boletaSeries.message}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {error && (
        <p className="text-caption text-destructive" role="alert">
          No se pudo guardar la configuración. Intenta de nuevo.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  );
}

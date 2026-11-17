import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SettingsCompanyForm } from '../components/SettingsCompanyForm';
import { useCompanySettings } from '../hooks/use-company-settings';

export function SettingsCompanyPage() {
  const { data: settings, isLoading, error } = useCompanySettings();

  return (
    <>
      <PageHeader>
        <PageTitle>Configuración</PageTitle>
      </PageHeader>
      <PageContent>
        {isLoading && <p>Cargando…</p>}
        {error && (
          <p className="text-caption text-destructive" role="alert">
            No se pudo cargar la configuración de la empresa.
          </p>
        )}
        {settings && <SettingsCompanyForm settings={settings} />}
      </PageContent>
    </>
  );
}

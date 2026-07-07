import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';

export function NotFoundPage() {
  return (
    <>
      <PageHeader>
        <PageTitle>404</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Página no encontrada">
          <p className="text-muted-foreground">Página no encontrada.</p>
        </SectionCard>
      </PageContent>
    </>
  );
}

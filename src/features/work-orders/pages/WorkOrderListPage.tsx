import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { getPageTitle } from '@/features/shell/lib/pageTitles';
import { useLocation } from 'react-router';

export function WorkOrderListPage() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title={title}>
          <p className="text-muted-foreground">
            Gestión de órdenes próximamente.
          </p>
        </SectionCard>
      </PageContent>
    </>
  );
}

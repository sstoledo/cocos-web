import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useCategories } from '@/features/categories/hooks/use-categories';
import type { Category } from '@/features/categories/types';
import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useParams } from 'react-router';
import { useCategory } from '../hooks/use-category';

function formatPrice(price: string): string {
  const num = Number(price);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
}

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: category,
    isLoading: isLoadingCategory,
    error,
  } = useCategory(id ?? '');
  const { categories, isLoading: isLoadingCategories } = useCategories({});
  const { products, isLoading: isLoadingProducts } = useProducts({});

  const childCategories = categories.filter((c: Category) => c.parentId === id);
  const categoryIds = new Set([
    id,
    ...childCategories.map((c: Category) => c.id),
  ]);
  const categoryProducts = products.filter((p: Product) =>
    categoryIds.has(p.category.id)
  );

  if (isLoadingCategory) {
    return (
      <output className="block py-8 text-center text-muted-foreground">
        Cargando…
      </output>
    );
  }

  if (error || !category) {
    return (
      <div className="p-6">
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          No se pudieron cargar los datos. Intentá de nuevo más tarde.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader className="flex items-center gap-3">
        <Link
          to="/categories"
          aria-label="Volver a categorías"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <PageTitle className="text-h3 lg:text-h2">{category.name}</PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la categoría">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="text-foreground">{category.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Categoría padre</dt>
              <dd className="text-foreground">
                {category.parent ? (
                  <Link
                    to={`/categories/${category.parent.id}`}
                    className="text-primary hover:underline"
                  >
                    {category.parent.name}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title={`Subcategorías (${childCategories.length})`}>
          {isLoadingCategories ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando subcategorías…
            </output>
          ) : childCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tiene subcategorías.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {childCategories.map((child) => (
                <li key={child.id}>
                  <Link
                    to={`/categories/${child.id}`}
                    className="flex items-center justify-between py-3 text-foreground hover:underline"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`Productos (${categoryProducts.length})`}>
          {isLoadingProducts ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando productos…
            </output>
          ) : categoryProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay productos en esta categoría.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Código
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Presentación
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/50">
                      <td className="p-3 font-mono">{product.code}</td>
                      <td className="p-3">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-primary hover:underline"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="p-3">{product.presentation.name}</td>
                      <td className="p-3 tabular-nums">
                        {formatPrice(product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

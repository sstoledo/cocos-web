import { cn } from '@/lib/utils';
import { IconCheck, IconPhoto, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { ProductListItem } from '../types';

export type ProductTableProps = {
  products: ProductListItem[];
  canEdit: boolean;
};

function getThumbnailUrl(imageUrl: string): string {
  return imageUrl.replace(
    '/image/upload/',
    '/image/upload/w_40,h_40,c_fill,f_auto/'
  );
}

function ProductThumbnail({ product }: { product: ProductListItem }) {
  if (!product.imageUrl) {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground"
        role="img"
        aria-label="Sin imagen"
      >
        <IconPhoto className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={getThumbnailUrl(product.imageUrl)}
      alt={product.name}
      loading="lazy"
      className="h-10 w-10 rounded object-cover"
    />
  );
}

function StatusBadge({ product }: { product: ProductListItem }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption font-semibold',
        product.isActive
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      )}
    >
      {product.isActive ? (
        <>
          <IconCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Activo
        </>
      ) : (
        <>
          <IconX className="h-3.5 w-3.5" aria-hidden="true" />
          Inactivo
        </>
      )}
    </span>
  );
}

const HEADERS = [
  'Código',
  'Imagen',
  'Nombre',
  'Marca',
  'Categoría',
  'Presentación',
  'Precio',
  'Stock',
  'Estado',
  'Acciones',
];

export function ProductTable({ products, canEdit }: ProductTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="h-11 px-3 text-caption font-semibold text-muted-foreground"
                >
                  {header === 'Imagen' ? (
                    <span className="sr-only">Imagen</span>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {product.code}
                </td>
                <td className="px-3">
                  <ProductThumbnail product={product} />
                </td>
                <td className="px-3 text-foreground">{product.name}</td>
                <td className="px-3 text-muted-foreground">
                  {product.brand.name}
                </td>
                <td className="px-3 text-muted-foreground">
                  {product.category.name}
                </td>
                <td className="px-3 text-muted-foreground">
                  {product.presentation.name}
                </td>
                <td className="px-3 text-right font-mono text-foreground">
                  {product.price}
                </td>
                <td className="px-3 text-right font-mono text-foreground">
                  {product.stock}
                </td>
                <td className="px-3">
                  <StatusBadge product={product} />
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/products/${product.id}/stock`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Stock
                    </Link>
                    {canEdit && (
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Editar
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            data-testid="product-mobile-card"
            className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ProductThumbnail product={product} />
                <div>
                  <p className="text-caption text-muted-foreground">
                    {product.code}
                  </p>
                  <p className="text-body-sm font-medium text-foreground">
                    {product.name}
                  </p>
                </div>
              </div>
              <StatusBadge product={product} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-caption text-muted-foreground">
              <span>{product.brand.name}</span>
              <span>{product.category.name}</span>
              <span>{product.presentation.name}</span>
              <span>Stock: {product.stock}</span>
            </div>
            <p className="text-right font-mono text-body font-semibold text-foreground">
              {product.price}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/products/${product.id}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver
              </Link>
              <Link
                to={`/products/${product.id}/stock`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Stock
              </Link>
              {canEdit && (
                <Link
                  to={`/products/${product.id}/edit`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Editar
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron productos.
        </p>
      )}
    </>
  );
}

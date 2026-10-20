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

export function ProductTable({ products, canEdit }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Código
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              <span className="sr-only">Imagen</span>
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Marca
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Categoría
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Presentación
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Precio
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Stock
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Estado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {product.code}
              </td>
              <td className="p-4">
                <ProductThumbnail product={product} />
              </td>
              <td className="p-4 text-foreground">{product.name}</td>
              <td className="p-4 text-muted-foreground">
                {product.brand.name}
              </td>
              <td className="p-4 text-muted-foreground">
                {product.category.name}
              </td>
              <td className="p-4 text-muted-foreground">
                {product.presentation.name}
              </td>
              <td className="p-4 text-foreground">{product.price}</td>
              <td className="p-4 text-foreground">{product.stock}</td>
              <td className="p-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    product.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/products/${product.id}/stock`}
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    Stock
                  </Link>
                  {canEdit && (
                    <Link
                      to={`/products/${product.id}/edit`}
                      className={cn(
                        'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
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
      {products.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron productos.
        </p>
      )}
    </div>
  );
}

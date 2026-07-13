import { cn } from '@/lib/utils';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Product } from '../types';

export type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Código
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
              Estado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Stock
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
                <Link
                  to={`/products/${product.id}/stock`}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  Stock
                </Link>
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

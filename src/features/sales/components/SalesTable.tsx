import { cn } from '@/lib/utils';
import { IconChevronRight, IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Sale } from '../types';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { SaleStatusBadge } from './SaleStatusBadge';

export type SalesTableProps = {
  sales: Sale[];
  mode?: 'sales' | 'refunds';
};

// Walk-in sales have no client; detail page copy applies here too (SL-F3).
function clientName(sale: Sale): string {
  return sale.client?.name ?? 'Cliente ocasional';
}

function saleDate(sale: Sale): string {
  return new Date(sale.createdAt).toLocaleDateString('es-AR');
}

export function SalesTable({ sales, mode = 'sales' }: SalesTableProps) {
  const isRefunds = mode === 'refunds';
  const headers = isRefunds
    ? [
        'N° Venta',
        'Fecha',
        'Cliente',
        'Método de pago',
        'Total',
        'Estado',
        'Acciones',
      ]
    : [
        'N° Venta',
        'Fecha',
        'Cliente',
        'Método de pago',
        'Estado',
        'Total',
        'Acciones',
      ];

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {headers.map((header) => (
                <th
                  key={header}
                  className={cn(
                    'h-11 px-3 text-caption font-semibold text-muted-foreground',
                    header === 'Total' && 'text-right'
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {sale.saleNumber}
                </td>
                <td className="px-3 text-muted-foreground">{saleDate(sale)}</td>
                <td className="px-3 text-muted-foreground">
                  {clientName(sale)}
                </td>
                <td className="px-3">
                  <PaymentMethodBadge
                    method={sale.paymentMethod}
                    variant={isRefunds ? 'badge' : 'plain'}
                  />
                </td>
                {isRefunds ? (
                  <>
                    <td className="px-3 text-right font-semibold text-foreground">
                      {sale.totalAmount}
                    </td>
                    <td className="px-3">
                      <SaleStatusBadge status={sale.status} />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3">
                      <SaleStatusBadge status={sale.status} />
                    </td>
                    <td className="px-3 text-right font-semibold text-foreground">
                      {sale.totalAmount}
                    </td>
                  </>
                )}
                <td className="px-3">
                  <Link
                    to={`/sales/${sale.id}`}
                    aria-label={
                      isRefunds ? undefined : `Ver venta ${sale.saleNumber}`
                    }
                    className={cn(
                      'inline-flex h-8 items-center justify-center rounded-md text-foreground transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isRefunds
                        ? 'border border-border bg-card px-3 text-sm font-medium'
                        : 'w-8'
                    )}
                  >
                    {isRefunds ? (
                      <>
                        <IconEye className="mr-1.5 h-3.5 w-3.5" />
                        Ver
                      </>
                    ) : (
                      <IconChevronRight className="h-4 w-4" />
                    )}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {sales.map((sale) =>
          isRefunds ? (
            <article
              key={sale.id}
              data-testid="refund-mobile-card"
              className="space-y-3 rounded-lg border bg-card p-3 shadow-stat"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">
                  {sale.saleNumber}
                </span>
                <SaleStatusBadge status={sale.status} />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-caption">
                <div>
                  <dt className="text-muted-foreground">Fecha</dt>
                  <dd>{saleDate(sale)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd>{clientName(sale)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Método de pago</dt>
                  <dd>
                    <PaymentMethodBadge
                      method={sale.paymentMethod}
                      variant="badge"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="text-body font-semibold">
                    {sale.totalAmount}
                  </dd>
                </div>
              </dl>
              <Link
                to={`/sales/${sale.id}`}
                className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="mr-1.5 h-4 w-4" />
                Ver
              </Link>
            </article>
          ) : (
            <Link
              key={sale.id}
              to={`/sales/${sale.id}`}
              data-testid="sale-mobile-card"
              className="block space-y-2 rounded-lg border bg-card p-3 shadow-stat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {sale.saleNumber}
                </span>
                <div className="flex items-center gap-1">
                  <SaleStatusBadge status={sale.status} />
                  <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
                <span>{clientName(sale)}</span>
                <span>{saleDate(sale)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <PaymentMethodBadge method={sale.paymentMethod} />
                <span className="text-body font-semibold text-foreground">
                  {sale.totalAmount}
                </span>
              </div>
            </Link>
          )
        )}
      </div>

      {sales.length === 0 && (
        <div className="py-8 text-center">
          {isRefunds && (
            <p className="font-medium text-foreground">Sin resultados</p>
          )}
          <p className="text-muted-foreground">No se encontraron ventas.</p>
        </div>
      )}
    </>
  );
}

import { cn } from '@/lib/utils';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Proforma } from '../types';
import { ProformaStatusBadge } from './ProformaStatusBadge';

function clientName(proforma: Proforma): string {
  return proforma.client?.name ?? 'Cliente ocasional';
}

export type ProformaTableProps = {
  proformas: Proforma[];
};

export function ProformaTable({ proformas }: ProformaTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              N° Proforma
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Cliente
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Total
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
          {proformas.map((proforma) => (
            <tr
              key={proforma.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {proforma.proformaNumber}
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(proforma.createdAt).toLocaleDateString('es-AR')}
              </td>
              <td className="p-4 text-muted-foreground">
                {clientName(proforma)}
              </td>
              <td className="p-4 text-muted-foreground">
                {proforma.totalAmount}
              </td>
              <td className="p-4">
                <ProformaStatusBadge status={proforma.status} />
              </td>
              <td className="p-4">
                <Link
                  to={`/proformas/${proforma.id}`}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors',
                    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <IconEye className="mr-1.5 h-3.5 w-3.5" />
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        {proformas.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No se encontraron proformas.
          </p>
        )}
      </table>
    </div>
  );
}

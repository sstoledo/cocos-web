import { DataTable, DataTableRow } from '@/components/ui/data-table';
import { formatMoney } from '@/lib/cents';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { Proforma } from '../types';
import { ProformaStatusBadge } from './ProformaStatusBadge';

function clientName(proforma: Proforma): string {
  return proforma.client?.name ?? 'Cliente ocasional';
}

function proformaDate(proforma: Proforma): string {
  return new Date(proforma.createdAt).toLocaleDateString('es-AR');
}

export type ProformaTableProps = {
  proformas: Proforma[];
};

export function ProformaTable({ proformas }: ProformaTableProps) {
  return (
    <>
      <DataTable
        headers={[
          { label: 'N° Proforma' },
          { label: 'Fecha' },
          { label: 'Cliente' },
          { label: 'Total' },
          { label: 'Estado' },
          { label: 'Acciones' },
        ]}
      >
        {proformas.map((proforma) => (
          <DataTableRow key={proforma.id}>
            <td className="px-3 font-medium text-foreground">
              {proforma.proformaNumber}
            </td>
            <td className="px-3 text-muted-foreground">
              {proformaDate(proforma)}
            </td>
            <td className="px-3 text-foreground">{clientName(proforma)}</td>
            <td className="px-3 font-mono font-medium text-foreground">
              {formatMoney(proforma.totalAmount)}
            </td>
            <td className="px-3">
              <ProformaStatusBadge status={proforma.status} />
            </td>
            <td className="px-3">
              <Link
                to={`/proformas/${proforma.id}`}
                aria-label={`Ver proforma ${proforma.proformaNumber}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconEye className="h-[18px] w-[18px]" />
              </Link>
            </td>
          </DataTableRow>
        ))}
      </DataTable>

      <div className="space-y-3 md:hidden">
        {proformas.map((proforma) => (
          <Link
            key={proforma.id}
            to={`/proformas/${proforma.id}`}
            aria-label={`Ver proforma ${proforma.proformaNumber}`}
            data-testid="proforma-mobile-card"
            className="block space-y-2 rounded-lg border bg-card p-3 shadow-stat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption font-semibold text-foreground">
                {proforma.proformaNumber}
              </span>
              <div className="flex items-center gap-1">
                <ProformaStatusBadge status={proforma.status} />
                <IconEye className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm text-foreground">
                {clientName(proforma)}
              </span>
              <span className="text-caption text-muted-foreground">
                {proformaDate(proforma)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">Total</span>
              <span className="font-mono text-body font-semibold text-foreground">
                {formatMoney(proforma.totalAmount)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {proformas.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron proformas.
        </p>
      )}
    </>
  );
}

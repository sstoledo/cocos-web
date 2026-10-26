import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import type { Receipt, ReceiptStatus } from '../types';

const STATUS_LABELS: Record<ReceiptStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  discarded: 'Descartado',
};

function extractionSummary(receipt: Receipt): string {
  if (!receipt.extracted) {
    return 'Sin extracción OCR';
  }
  const { supplierName, documentNumber, items } = receipt.extracted;
  return [supplierName, documentNumber, `${items.length} ítem(s)`]
    .filter(Boolean)
    .join(' · ');
}

export function ReceiptTable({ receipts }: { receipts: Receipt[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Archivo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Fecha de carga
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Estado
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Datos extraídos
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr
              key={receipt.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {receipt.fileName}
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(receipt.createdAt).toLocaleString('es-AR')}
              </td>
              <td className="p-4">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    receipt.status === 'confirmed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    receipt.status === 'discarded' &&
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    receipt.status === 'pending' &&
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  )}
                >
                  {STATUS_LABELS[receipt.status]}
                </span>
              </td>
              <td className="max-w-md p-4 text-muted-foreground">
                {extractionSummary(receipt)}
              </td>
              <td className="p-4">
                <Link
                  to={`/receipts/${receipt.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {receipt.status === 'pending' ? 'Revisar' : 'Ver detalle'}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {receipts.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron comprobantes.
        </p>
      )}
    </div>
  );
}

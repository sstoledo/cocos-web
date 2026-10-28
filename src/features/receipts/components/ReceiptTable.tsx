import { Link } from 'react-router';
import type { Receipt, ReceiptStatus } from '../types';

const STATUS_LABELS: Record<ReceiptStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  discarded: 'Descartado',
};

const STATUS_STYLES: Record<ReceiptStatus, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-success text-success-foreground',
  discarded: 'bg-destructive text-destructive-foreground',
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

function uploadDate(receipt: Receipt): string {
  return new Date(receipt.createdAt).toLocaleString('es-AR');
}

function statusBadge(receipt: Receipt) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${STATUS_STYLES[receipt.status]}`}
    >
      {STATUS_LABELS[receipt.status]}
    </span>
  );
}

export function ReceiptTable({ receipts }: { receipts: Receipt[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full caption-bottom text-body-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              {[
                'Archivo',
                'Fecha de carga',
                'Estado',
                'Datos extraídos',
                'Acciones',
              ].map((header) => (
                <th
                  key={header}
                  className="h-11 px-3 text-caption font-semibold text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr
                key={receipt.id}
                className="h-14 border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-3 font-medium text-foreground">
                  {receipt.fileName}
                </td>
                <td className="px-3 text-muted-foreground">
                  {uploadDate(receipt)}
                </td>
                <td className="px-3">{statusBadge(receipt)}</td>
                <td className="max-w-md px-3 text-muted-foreground">
                  {extractionSummary(receipt)}
                </td>
                <td className="px-3">
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
      </div>

      <div className="space-y-3 md:hidden">
        {receipts.map((receipt) => (
          <Link
            key={receipt.id}
            to={`/receipts/${receipt.id}`}
            data-testid="receipt-mobile-card"
            className="block space-y-2 rounded-lg border bg-card p-3 shadow-stat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-sm font-medium text-foreground">
                {receipt.fileName}
              </span>
              {statusBadge(receipt)}
            </div>
            <p className="text-caption text-muted-foreground">
              {uploadDate(receipt)}
            </p>
            <p className="text-caption text-muted-foreground">
              {extractionSummary(receipt)}
            </p>
            <span className="text-body-sm font-medium text-primary">
              {receipt.status === 'pending' ? 'Revisar' : 'Ver detalle'}
            </span>
          </Link>
        ))}
      </div>

      {receipts.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron comprobantes.
        </p>
      )}
    </>
  );
}

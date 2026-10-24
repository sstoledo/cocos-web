import { cn } from '@/lib/utils';
import type { ProformaStatus } from '../types';

export const PROFORMA_STATUS_LABELS: Record<ProformaStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  converted: 'Convertida',
};

const PROFORMA_STATUS_STYLES: Record<ProformaStatus, string> = {
  draft: 'bg-slate-100 text-slate-800 border-slate-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  converted: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function ProformaStatusBadge({ status }: { status: ProformaStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PROFORMA_STATUS_STYLES[status]
      )}
    >
      {PROFORMA_STATUS_LABELS[status]}
    </span>
  );
}

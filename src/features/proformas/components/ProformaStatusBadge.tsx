import type { ProformaStatus } from '../types';

export const PROFORMA_STATUS_LABELS: Record<ProformaStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  converted: 'Convertida',
};

const PROFORMA_STATUS_STYLES: Record<ProformaStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary text-primary-foreground',
  accepted: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  converted: 'border border-primary bg-muted text-primary',
};

export function ProformaStatusBadge({ status }: { status: ProformaStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${PROFORMA_STATUS_STYLES[status]}`}
    >
      {PROFORMA_STATUS_LABELS[status]}
    </span>
  );
}

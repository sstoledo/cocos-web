import { toCents } from '@/lib/cents';
import { jsPDF } from 'jspdf';
import type { CashClosing } from '../types';

// PDF report for a cash closing (F12.4). Money stays as verbatim decimal
// strings — the only transformation is the explicit sign on a positive
// difference, which never touches arithmetic (WOF-F6).
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function signedDifference(difference: string): string {
  if (difference.startsWith('-') || toCents(difference) === 0) {
    return difference;
  }
  return `+${difference}`;
}

export function generateCashClosingPdf(closing: CashClosing): void {
  const doc = new jsPDF();
  const margin = 20;
  const lineHeight = 8;
  let y = margin;

  doc.setFontSize(18);
  doc.text('Cierre de caja', margin, y);
  y += lineHeight * 1.5;

  doc.setFontSize(12);
  const line = (label: string, value: string) => {
    doc.text(`${label}: ${value}`, margin, y);
    y += lineHeight;
  };

  line('Inicio del período', formatDateTime(closing.periodStart));
  line('Fin del período', formatDateTime(closing.periodEnd));
  line('Efectivo esperado', closing.expectedCash);
  line('Tarjeta esperada', closing.expectedCard);
  line('Transferencia esperada', closing.expectedTransfer);
  line('Efectivo declarado', closing.declaredCash);
  line('Diferencia', signedDifference(closing.difference));
  line('Ventas', String(closing.salesCount));
  line('Cerrado por', closing.closedBy.name);
  if (closing.notes) {
    line('Notas', closing.notes);
  }
  line('Generado el', formatDateTime(new Date().toISOString()));

  doc.save(`cierre-caja-${closing.periodEnd.slice(0, 10)}.pdf`);
}

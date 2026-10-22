import { jsPDF } from 'jspdf';
import type { Proforma } from '../types';

// Client-side proforma PDF (S4). Money stays as verbatim decimal strings —
// the snapshots and totals come from the backend, no arithmetic here.
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function generateProformaPdf(proforma: Proforma): void {
  const doc = new jsPDF();
  const margin = 20;
  const lineHeight = 8;
  let y = margin;

  doc.setFontSize(18);
  doc.text(`Proforma ${proforma.proformaNumber}`, margin, y);
  y += lineHeight * 1.5;

  doc.setFontSize(12);
  const line = (label: string, value: string) => {
    doc.text(`${label}: ${value}`, margin, y);
    y += lineHeight;
  };

  line('Fecha', formatDateTime(proforma.createdAt));
  line('Cliente', proforma.client?.name ?? 'Cliente ocasional');
  if (proforma.branch) {
    line('Sucursal', proforma.branch.name);
  }
  if (proforma.employee) {
    line('Empleado', proforma.employee.name);
  }

  y += lineHeight;
  doc.text('Productos', margin, y);
  y += lineHeight;

  doc.setFontSize(10);
  for (const productLine of proforma.products) {
    doc.text(
      `${productLine.product.name} x${productLine.quantity} — ` +
        `${productLine.unitPriceSnapshot} = ${productLine.subtotal}`,
      margin,
      y
    );
    y += lineHeight;
  }

  doc.setFontSize(12);
  y += lineHeight;
  line('Total', proforma.totalAmount);

  if (proforma.notes) {
    line('Notas', proforma.notes);
  }
  line('Generado el', formatDateTime(new Date().toISOString()));

  doc.save(`proforma-${proforma.proformaNumber}.pdf`);
}

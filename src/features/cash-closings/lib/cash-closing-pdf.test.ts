import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CashClosing } from '../types';
import { generateCashClosingPdf } from './cash-closing-pdf';

const { textMock, saveMock } = vi.hoisted(() => ({
  textMock: vi.fn(),
  saveMock: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: textMock,
    save: saveMock,
  })),
}));

function buildClosing(overrides: Partial<CashClosing> = {}): CashClosing {
  return {
    id: 'cc1',
    periodStart: '2026-09-23T10:00:00.000Z',
    periodEnd: '2026-09-23T20:00:00.000Z',
    expectedCash: '1250.00',
    expectedCard: '3400.50',
    expectedTransfer: '800.00',
    declaredCash: '1300.00',
    difference: '50.00',
    salesCount: 12,
    notes: 'Cierre del turno',
    createdAt: '2026-09-23T20:05:00.000Z',
    closedBy: { id: 'u1', name: 'Ana García' },
    ...overrides,
  };
}

function textLines(): string[] {
  return textMock.mock.calls.map((call) => String(call[0]));
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

describe('generateCashClosingPdf', () => {
  beforeEach(() => {
    textMock.mockClear();
    saveMock.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-24T09:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes the report title', () => {
    generateCashClosingPdf(buildClosing());

    expect(textLines()).toContain('Cierre de caja');
  });

  it('writes both period dates es-AR formatted, never raw ISO', () => {
    generateCashClosingPdf(buildClosing());

    const lines = textLines();
    expect(
      lines.some((line) =>
        line.includes(formatDateTime('2026-09-23T10:00:00.000Z'))
      )
    ).toBe(true);
    expect(
      lines.some((line) =>
        line.includes(formatDateTime('2026-09-23T20:00:00.000Z'))
      )
    ).toBe(true);
    expect(lines.some((line) => line.includes('2026-09-23T'))).toBe(false);
  });

  it('writes all three expected amounts verbatim as decimal strings', () => {
    generateCashClosingPdf(buildClosing());

    const lines = textLines();
    expect(lines).toContain('Efectivo esperado: 1250.00');
    expect(lines).toContain('Tarjeta esperada: 3400.50');
    expect(lines).toContain('Transferencia esperada: 800.00');
  });

  it('writes the declared cash verbatim', () => {
    generateCashClosingPdf(buildClosing());

    expect(textLines()).toContain('Efectivo declarado: 1300.00');
  });

  it('writes a positive difference with an explicit + sign', () => {
    generateCashClosingPdf(buildClosing({ difference: '50.00' }));

    expect(textLines()).toContain('Diferencia: +50.00');
  });

  it('writes a negative difference with its - sign verbatim', () => {
    generateCashClosingPdf(buildClosing({ difference: '-50.00' }));

    expect(textLines()).toContain('Diferencia: -50.00');
  });

  it('writes a zero difference without a sign', () => {
    generateCashClosingPdf(buildClosing({ difference: '0.00' }));

    expect(textLines()).toContain('Diferencia: 0.00');
  });

  it('writes the sales count', () => {
    generateCashClosingPdf(buildClosing());

    expect(textLines()).toContain('Ventas: 12');
  });

  it('writes the closedBy name', () => {
    generateCashClosingPdf(buildClosing());

    expect(textLines()).toContain('Cerrado por: Ana García');
  });

  it('writes the notes when present', () => {
    generateCashClosingPdf(buildClosing());

    expect(textLines()).toContain('Notas: Cierre del turno');
  });

  it('omits the notes line when the closing has no notes', () => {
    generateCashClosingPdf(buildClosing({ notes: null }));

    expect(textLines().some((line) => line.startsWith('Notas'))).toBe(false);
  });

  it('writes the generation timestamp es-AR formatted', () => {
    generateCashClosingPdf(buildClosing());

    const lines = textLines();
    const generated = lines.find((line) => line.startsWith('Generado el'));
    expect(generated).toBeDefined();
    expect(generated).toContain(formatDateTime('2026-09-24T09:30:00.000Z'));
  });

  it('saves the file named after the period end date', () => {
    generateCashClosingPdf(buildClosing());

    expect(saveMock).toHaveBeenCalledWith('cierre-caja-2026-09-23.pdf');
  });
});

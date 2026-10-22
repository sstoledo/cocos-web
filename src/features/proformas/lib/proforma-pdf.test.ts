import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildProforma } from '../test/fixtures';
import { generateProformaPdf } from './proforma-pdf';

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

function textLines(): string[] {
  return textMock.mock.calls.map((call) => String(call[0]));
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

describe('generateProformaPdf', () => {
  beforeEach(() => {
    textMock.mockClear();
    saveMock.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T09:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes the title with the proforma number', () => {
    generateProformaPdf(buildProforma());

    expect(textLines()).toContain('Proforma PRO-2026-000001');
  });

  it('writes the creation date es-AR formatted, never raw ISO', () => {
    generateProformaPdf(buildProforma());

    const lines = textLines();
    expect(
      lines.some((line) =>
        line.includes(formatDateTime('2024-01-01T00:00:00.000Z'))
      )
    ).toBe(true);
    expect(lines.some((line) => line.includes('2024-01-01T'))).toBe(false);
  });

  it('writes the client name', () => {
    generateProformaPdf(buildProforma());

    expect(textLines()).toContain('Cliente: Juan Pérez');
  });

  it('writes Cliente ocasional for walk-in proformas', () => {
    generateProformaPdf(buildProforma({ client: null, clientId: null }));

    expect(textLines()).toContain('Cliente: Cliente ocasional');
  });

  it('writes every product line with quantity, price and subtotal', () => {
    generateProformaPdf(buildProforma());

    const lines = textLines();
    expect(
      lines.some(
        (line) =>
          line.includes('Filtro de aceite') &&
          line.includes('1') &&
          line.includes('80.50')
      )
    ).toBe(true);
  });

  it('writes the total verbatim as a decimal string', () => {
    generateProformaPdf(buildProforma());

    expect(textLines()).toContain('Total: 80.50');
  });

  it('writes the notes when present', () => {
    generateProformaPdf(buildProforma({ notes: 'Válida por 15 días' }));

    expect(textLines()).toContain('Notas: Válida por 15 días');
  });

  it('omits the notes line when the proforma has no notes', () => {
    generateProformaPdf(buildProforma({ notes: null }));

    expect(textLines().some((line) => line.startsWith('Notas'))).toBe(false);
  });

  it('writes the generation timestamp es-AR formatted', () => {
    generateProformaPdf(buildProforma());

    const lines = textLines();
    const generated = lines.find((line) => line.startsWith('Generado el'));
    expect(generated).toBeDefined();
    expect(generated).toContain(formatDateTime('2026-10-22T09:30:00.000Z'));
  });

  it('saves the file named after the proforma number', () => {
    generateProformaPdf(buildProforma());

    expect(saveMock).toHaveBeenCalledWith('proforma-PRO-2026-000001.pdf');
  });
});

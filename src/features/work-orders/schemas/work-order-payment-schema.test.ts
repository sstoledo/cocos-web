import { describe, expect, it } from 'vitest';
import { createWorkOrderPaymentSchema } from './work-order-payment-schema';

const schema = createWorkOrderPaymentSchema('150.00');

function parse(values: Record<string, unknown>) {
  return schema.safeParse(values);
}

describe('workOrderPaymentSchema', () => {
  it('accepts a valid payment within the remaining balance', () => {
    const result = parse({ amount: '150.00', paymentMethod: 'cash' });

    expect(result.success).toBe(true);
  });

  it('rejects an empty amount', () => {
    const result = parse({ amount: '', paymentMethod: 'cash' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El monto es requerido');
    }
  });

  it.each(['abc', '-10', '10.999', '10,50'])(
    'rejects invalid amount %s',
    (amount) => {
      const result = parse({ amount, paymentMethod: 'cash' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Ingresá un monto válido (hasta 2 decimales)'
        );
      }
    }
  );

  it('rejects a zero amount', () => {
    const result = parse({ amount: '0.00', paymentMethod: 'cash' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'El monto debe ser mayor a cero'
      );
    }
  });

  it('rejects an amount above the remaining balance', () => {
    const result = parse({ amount: '150.01', paymentMethod: 'cash' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'El monto no puede superar el saldo restante (150.00)'
      );
    }
  });

  it('rejects a missing payment method', () => {
    const result = parse({ amount: '10.00', paymentMethod: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Seleccioná un método de pago'
      );
    }
  });
});

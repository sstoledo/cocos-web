import { describe, expect, it } from 'vitest';
import { vehicleSchema } from './vehicle-schema';

describe('vehicleSchema', () => {
  describe('valid plates', () => {
    const validPlates = [
      'ABC-123',
      'ABC123',
      'A1B234',
      'AB1234',
      'EAB123',
      'abc-123',
      '  ABC-123  ',
      'A-B-C-1-2-3',
    ];

    for (const plate of validPlates) {
      it(`accepts valid plate: ${plate}`, () => {
        const result = vehicleSchema.safeParse({
          plate,
          brand: 'Toyota',
          model: 'Corolla',
          clientId: 'client-1',
        });
        expect(result.success).toBe(true);
      });
    }
  });

  describe('invalid plates', () => {
    const invalidPlates = [
      'ABCD-123',
      'ABC-12',
      '123-456',
      'ABC-1234',
      'AB-123',
      '',
    ];

    for (const plate of invalidPlates) {
      it(`rejects invalid plate: ${plate}`, () => {
        const result = vehicleSchema.safeParse({
          plate,
          brand: 'Toyota',
          model: 'Corolla',
          clientId: 'client-1',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          if (plate === '') {
            expect(result.error.issues[0].message).toBe(
              'La placa es requerida'
            );
          } else {
            expect(result.error.issues[0].message).toBe(
              'Placa peruana no válida'
            );
          }
        }
      });
    }
  });

  describe('required fields', () => {
    it('requires brand', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: '',
        model: 'Corolla',
        clientId: 'client-1',
      });
      expect(result.success).toBe(false);
    });

    it('requires model', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: '',
        clientId: 'client-1',
      });
      expect(result.success).toBe(false);
    });

    it('requires clientId', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('accepts undefined year', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
        year: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid year', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
        year: 2020,
      });
      expect(result.success).toBe(true);
    });

    it('rejects year before 1900', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
        year: 1899,
      });
      expect(result.success).toBe(false);
    });

    it('accepts optional color', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
        color: 'Rojo',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional notes', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
        notes: 'Notas del vehículo',
      });
      expect(result.success).toBe(true);
    });

    it('defaults isActive to true', () => {
      const result = vehicleSchema.safeParse({
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });
  });

  describe('plate normalization', () => {
    it('normalizes plate to uppercase without hyphens/spaces', () => {
      const result = vehicleSchema.safeParse({
        plate: 'abc-123',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC123');
      }
    });

    it('normalizes plate with spaces', () => {
      const result = vehicleSchema.safeParse({
        plate: ' ABC 123 ',
        brand: 'Toyota',
        model: 'Corolla',
        clientId: 'client-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC123');
      }
    });
  });
});

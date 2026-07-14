import { describe, expect, it } from 'vitest';
import { vehicleSchema } from './vehicle-schema';

const baseValues = {
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'Rojo',
  notes: 'Mantenimiento al día',
  clientId: 'c1',
};

describe('vehicleSchema', () => {
  it('accepts a valid AAA-111 plate', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'ABC-123' });
    expect(result.success).toBe(true);
    expect(result.data?.plate).toBe('ABC123');
  });

  it('accepts a valid A1A-111 plate', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'A1B-234' });
    expect(result.success).toBe(true);
    expect(result.data?.plate).toBe('A1B234');
  });

  it('accepts a valid AA-1111 plate', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'AB-1234' });
    expect(result.success).toBe(true);
    expect(result.data?.plate).toBe('AB1234');
  });

  it('accepts a valid E-AA-111 plate', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'EAA-123' });
    expect(result.success).toBe(true);
    expect(result.data?.plate).toBe('EAA123');
  });

  it('normalizes lowercase letters, spaces and hyphens', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'abc 123' });
    expect(result.success).toBe(true);
    expect(result.data?.plate).toBe('ABC123');
  });

  it('rejects a missing plate', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid plate format', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, plate: 'XYZ' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing brand', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, brand: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing model', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, model: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a year before 1900', () => {
    const result = vehicleSchema.safeParse({ ...baseValues, year: 1800 });
    expect(result.success).toBe(false);
  });

  it('allows optional year, color and notes', () => {
    const result = vehicleSchema.safeParse({
      plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      clientId: 'c1',
    });
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { serviceSchema } from './service-schema';

const validService = {
  code: 'SRV-001',
  name: 'Cambio de aceite',
  description: 'Cambio de aceite y filtro',
  price: 150,
  estimatedDuration: 30,
  isActive: true,
};

describe('serviceSchema', () => {
  it('accepts a valid service', () => {
    const result = serviceSchema.safeParse(validService);
    expect(result.success).toBe(true);
  });

  it('requires code', () => {
    const result = serviceSchema.safeParse({ ...validService, code: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['code']);
    }
  });

  it('requires name', () => {
    const result = serviceSchema.safeParse({ ...validService, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['name']);
    }
  });

  it('validates code max length', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      code: 'a'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['code']);
    }
  });

  it('validates name max length', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      name: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['name']);
    }
  });

  it('requires positive price', () => {
    const result = serviceSchema.safeParse({ ...validService, price: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['price']);
    }
  });

  it('coerces price from string', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      price: '150.50',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(150.5);
    }
  });

  it('validates estimatedDuration as positive integer when provided', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      estimatedDuration: -5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['estimatedDuration']);
    }
  });

  it('allows optional estimatedDuration to be undefined', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      estimatedDuration: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('coerces estimatedDuration from string', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      estimatedDuration: '45',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedDuration).toBe(45);
    }
  });

  it('rejects non-integer estimatedDuration', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      estimatedDuration: 30.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(['estimatedDuration']);
    }
  });

  it('defaults isActive to true', () => {
    const result = serviceSchema.safeParse({
      code: 'SRV-001',
      name: 'Test',
      price: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it('allows optional description', () => {
    const result = serviceSchema.safeParse({
      ...validService,
      description: undefined,
    });
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { supplierSchema } from './supplier-schema';

const validValues = {
  name: 'Proveedor Ejemplo S.A.',
  phone: '999888777',
  email: 'contacto@proveedor.com',
  address: 'Av. Industrial 123',
  isActive: true,
};

describe('supplierSchema', () => {
  it('accepts valid values', () => {
    expect(supplierSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts minimal values', () => {
    const result = supplierSchema.safeParse({
      name: 'Proveedor Mínimo',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      name: 'a'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('rejects phone longer than 50 characters', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      phone: 'a'.repeat(51),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects email longer than 100 characters', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      email: `a${'b'.repeat(98)}@c.com`,
    });

    expect(result.success).toBe(false);
  });

  it('rejects address longer than 200 characters', () => {
    const result = supplierSchema.safeParse({
      ...validValues,
      address: 'a'.repeat(201),
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty optional fields', () => {
    const result = supplierSchema.safeParse({
      name: 'Proveedor',
      phone: '',
      email: '',
      address: '',
    });

    expect(result.success).toBe(true);
  });

  it('defaults isActive to true when not provided', () => {
    const result = supplierSchema.safeParse({
      name: 'Proveedor',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });
});

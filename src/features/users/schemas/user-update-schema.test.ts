import { describe, expect, it } from 'vitest';
import { userUpdateSchema } from './user-update-schema';

describe('userUpdateSchema', () => {
  it('accepts a partial payload with a single field', () => {
    const result = userUpdateSchema.safeParse({ name: 'Nuevo Nombre' });

    expect(result.success).toBe(true);
  });

  it('accepts a payload with every field', () => {
    const result = userUpdateSchema.safeParse({
      name: 'Nuevo Nombre',
      email: 'nuevo@example.com',
      roleId: 'clx123',
      isActive: false,
    });

    expect(result.success).toBe(true);
  });

  it('accepts isActive false on its own', () => {
    const result = userUpdateSchema.safeParse({ isActive: false });

    expect(result.success).toBe(true);
  });

  it('rejects an empty payload', () => {
    const result = userUpdateSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = userUpdateSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = userUpdateSchema.safeParse({ email: 'not-an-email' });

    expect(result.success).toBe(false);
  });

  it('rejects an empty roleId', () => {
    const result = userUpdateSchema.safeParse({ roleId: '' });

    expect(result.success).toBe(false);
  });
});

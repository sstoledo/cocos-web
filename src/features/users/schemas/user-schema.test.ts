import { describe, expect, it } from 'vitest';
import { userSchema } from './user-schema';

const validValues = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'secret123',
  roleId: 'clx123',
};

describe('userSchema', () => {
  it('accepts a valid payload', () => {
    expect(userSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts a password of exactly 8 characters', () => {
    const result = userSchema.safeParse({
      ...validValues,
      password: '12345678',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = userSchema.safeParse({
      ...validValues,
      password: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = userSchema.safeParse({
      ...validValues,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = userSchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty roleId', () => {
    const result = userSchema.safeParse({
      ...validValues,
      roleId: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a payload missing the password', () => {
    const { password: _password, ...withoutPassword } = validValues;

    expect(userSchema.safeParse(withoutPassword).success).toBe(false);
  });
});

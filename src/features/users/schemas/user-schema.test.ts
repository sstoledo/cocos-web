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

  it('accepts an employeeId', () => {
    const result = userSchema.safeParse({
      ...validValues,
      employeeId: 'emp-1',
    });

    expect(result.success).toBe(true);
    expect(result.data?.employeeId).toBe('emp-1');
  });

  it('preprocesses an empty employeeId to null', () => {
    const result = userSchema.safeParse({
      ...validValues,
      employeeId: '',
    });

    expect(result.success).toBe(true);
    expect(result.data?.employeeId).toBeNull();
  });

  it('accepts a payload without employeeId', () => {
    const result = userSchema.safeParse(validValues);

    expect(result.success).toBe(true);
    expect(result.data?.employeeId).toBeUndefined();
  });
});

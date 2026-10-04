import { describe, expect, it } from 'vitest';
import { categorySchema } from './category-schema';

const validValues = {
  name: 'Categoría Ejemplo',
  parentId: 'parent-1',
};

describe('categorySchema', () => {
  it('accepts valid values', () => {
    expect(categorySchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts minimal values', () => {
    const result = categorySchema.safeParse({
      name: 'Categoría Mínima',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = categorySchema.safeParse({
      ...validValues,
      name: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = categorySchema.safeParse({
      ...validValues,
      name: 'a'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('accepts null parentId', () => {
    const result = categorySchema.safeParse({
      name: 'Categoría',
      parentId: null,
    });

    expect(result.success).toBe(true);
  });

  it('accepts undefined parentId', () => {
    const result = categorySchema.safeParse({
      name: 'Categoría',
    });

    expect(result.success).toBe(true);
  });
});

import { z } from 'zod';

export const userUpdateSchema = z
  .object({
    name: z.string().min(1, 'Nombre requerido').max(100).optional(),
    email: z.string().email('Email inválido').max(255).optional(),
    roleId: z.string().min(1, 'Rol inválido').optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Al menos un campo es requerido',
  });

export type UserUpdateValues = z.infer<typeof userUpdateSchema>;

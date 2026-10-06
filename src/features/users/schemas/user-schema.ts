import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  name: z.string().min(1, 'Nombre requerido').max(100),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(100),
  roleId: z.string().min(1, 'Rol inválido'),
});

export type UserFormValues = z.infer<typeof userSchema>;

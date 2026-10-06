import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { useRoles } from '@/features/auth/hooks/use-roles';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { Link } from 'react-router';
import type { UserFormValues } from '../schemas/user-schema';
import { userSchema } from '../schemas/user-schema';
import type { UserUpdateValues } from '../schemas/user-update-schema';
import { userUpdateSchema } from '../schemas/user-update-schema';

interface UserFormProps {
  defaultValues?: Partial<UserFormValues | UserUpdateValues>;
  onSubmit: (values: UserFormValues | UserUpdateValues) => void;
  isPending?: boolean;
  isEdit?: boolean;
}

export function UserForm({
  defaultValues,
  onSubmit,
  isPending,
  isEdit = false,
}: UserFormProps) {
  const { roles, isLoading: isLoadingRoles } = useRoles();

  const schema = isEdit ? userUpdateSchema : userSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues | UserUpdateValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: '',
          email: '',
          roleId: '',
          isActive: true,
          ...defaultValues,
        }
      : {
          email: '',
          name: '',
          password: '',
          roleId: '',
          ...defaultValues,
        },
  });

  function handleFormSubmit(values: UserFormValues | UserUpdateValues) {
    onSubmit(values);
  }

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  // The edit schema has no password field, so narrow the union before reading it.
  const passwordError = isEdit
    ? undefined
    : (errors as FieldErrors<UserFormValues>).password;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          placeholder="Nombre completo"
          aria-invalid={errors.name ? 'true' : 'false'}
          {...register('name')}
          disabled={isEdit && !defaultValues?.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email')}
          disabled={isEdit && !defaultValues?.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={passwordError ? 'true' : 'false'}
            {...register('password')}
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-sm text-destructive" role="alert">
              {passwordError.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="roleId">Rol</Label>
        <Select
          id="roleId"
          options={roleOptions}
          placeholder="Seleccionar rol"
          disabled={isLoadingRoles}
          aria-invalid={errors.roleId ? 'true' : 'false'}
          error={errors.roleId?.message}
          {...register('roleId')}
        />
        {errors.roleId && (
          <p className="text-sm text-destructive" role="alert">
            {errors.roleId.message}
          </p>
        )}
      </div>

      {isEdit && (
        <div className="flex items-center space-x-2">
          <Input
            id="isActive"
            type="checkbox"
            className="h-4 w-4"
            {...register('isActive')}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Activo
          </Label>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isPending || isLoadingRoles}>
          {isPending
            ? 'Guardando…'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear usuario'}
        </Button>
        <Link
          to="/users"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md px-4 font-medium text-foreground transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';
import { Logo } from '../components/Logo';
import { useResetPassword } from '../hooks/useResetPassword';

const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { mutate, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    mutate(values, {
      onSuccess: () => setIsSuccess(true),
    });
  };

  return (
    <div
      className={cn(
        'w-full max-w-md space-y-6',
        'sm:rounded-2xl sm:border sm:border-border sm:bg-card',
        'sm:p-8 sm:shadow-card'
      )}
    >
      <div className="space-y-4">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>
      </div>

      {isSuccess ? (
        <div
          className={cn(
            'rounded-lg border border-border bg-card p-4',
            'text-center text-card-foreground'
          )}
        >
          <p className="text-sm">
            Check your email for a reset link. If you don&apos;t see it, check
            your spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="text-center text-sm">
        Remember your password?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

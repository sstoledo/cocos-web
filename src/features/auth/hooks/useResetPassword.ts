import { authClient } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';

export type ResetPasswordInput = {
  email: string;
};

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email }: ResetPasswordInput) => {
      const response = await authClient.sendVerificationEmail({ email });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
}

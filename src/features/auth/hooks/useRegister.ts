import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, name }: RegisterInput) => {
      const response = await authClient.signUp.email({ email, password, name });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });
}

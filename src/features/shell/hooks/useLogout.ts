import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/login');
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../api/create-user';
import type { CreateUserPayload } from '../api/create-user';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

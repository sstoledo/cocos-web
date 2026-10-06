import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../api/update-user';
import type { UpdateUserPayload } from '../api/update-user';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', id] });
    },
  });
}

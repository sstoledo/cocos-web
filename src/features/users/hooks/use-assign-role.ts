import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignRole } from '../api/assign-role';
import type { AssignRolePayload } from '../api/assign-role';

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignRolePayload }) =>
      assignRole(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', id] });
    },
  });
}

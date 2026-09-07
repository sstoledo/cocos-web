import { Button } from '@/components/ui/Button';
import { useUser } from '@/features/shell/hooks/useUser';
import { ApiError } from '@/lib/api-error';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTransitionWorkOrder } from '../hooks/use-transition-work-order-status';
import { getWorkOrderErrorMessage } from '../lib/work-order-error-messages';
import {
  ALLOWED_TRANSITIONS,
  TRANSITION_BUTTONS,
} from '../lib/work-order-transitions';
import type { WorkOrderProductLine, WorkOrderStatus } from '../types';

const TRANSITION_ROLES = ['Admin', 'Reception', 'Mechanic'];

interface WorkOrderStatusActionsProps {
  orderId: string;
  status: WorkOrderStatus;
  products: WorkOrderProductLine[];
}

export function WorkOrderStatusActions({
  orderId,
  status,
  products,
}: WorkOrderStatusActionsProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const transition = useTransitionWorkOrder();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<WorkOrderStatus | null>(
    null
  );

  const canTransition = TRANSITION_ROLES.includes(user?.role?.name ?? '');
  const targets = ALLOWED_TRANSITIONS[status];

  if (!canTransition || targets.length === 0) {
    return null;
  }

  function handleTransition(target: WorkOrderStatus) {
    const meta = TRANSITION_BUTTONS[target];
    if (!meta) {
      return;
    }

    if (meta.confirmMessage && !window.confirm(meta.confirmMessage)) {
      return;
    }

    setErrorMessage(null);
    setActiveTarget(target);
    transition.mutate(
      { id: orderId, status: target },
      {
        onError: (error) => {
          if (
            error instanceof ApiError &&
            error.errorCode === 'INVALID_STATUS_TRANSITION'
          ) {
            queryClient.invalidateQueries({
              queryKey: ['work-order', orderId],
            });
          }
          setErrorMessage(getWorkOrderErrorMessage(error, { products }));
        },
        onSettled: () => setActiveTarget(null),
      }
    );
  }

  return (
    <div className="flex items-center gap-2">
      {targets.map((target) => {
        const meta = TRANSITION_BUTTONS[target];
        if (!meta) {
          return null;
        }

        const isActive = transition.isPending && activeTarget === target;

        return (
          <Button
            key={target}
            type="button"
            variant={meta.variant}
            disabled={transition.isPending}
            onClick={() => handleTransition(target)}
            className={
              target === 'cancelled'
                ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
                : undefined
            }
          >
            {isActive ? meta.loadingLabel : meta.label}
          </Button>
        );
      })}
      {errorMessage && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

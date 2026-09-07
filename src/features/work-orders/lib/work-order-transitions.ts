import type { WorkOrderStatus } from '../types';

// DRIFT WARNING: render-only mirror of the backend ALLOWED_TRANSITIONS (B7.3).
// The backend 409 errorCode (INVALID_STATUS_TRANSITION) is the source of
// truth; this map only decides which buttons to render.
export const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['done', 'cancelled'],
  done: [],
  cancelled: [],
};

export interface TransitionButtonMeta {
  label: string;
  loadingLabel: string;
  variant: 'default' | 'outline';
  confirmMessage?: string;
}

export const TRANSITION_BUTTONS: Partial<
  Record<WorkOrderStatus, TransitionButtonMeta>
> = {
  in_progress: {
    label: 'Iniciar trabajo',
    loadingLabel: 'Iniciando…',
    variant: 'default',
  },
  done: {
    label: 'Marcar como terminada',
    loadingLabel: 'Terminando…',
    variant: 'default',
    confirmMessage:
      '¿Marcar la orden como terminada? Se descontará el stock de los productos.',
  },
  cancelled: {
    label: 'Cancelar orden',
    loadingLabel: 'Cancelando…',
    variant: 'outline',
    confirmMessage: '¿Cancelar esta orden? Esta acción es irreversible.',
  },
};

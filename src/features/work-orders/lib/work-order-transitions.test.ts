import { describe, expect, it } from 'vitest';
import type { WorkOrderStatus } from '../types';
import {
  ALLOWED_TRANSITIONS,
  TRANSITION_BUTTONS,
} from './work-order-transitions';

describe('ALLOWED_TRANSITIONS', () => {
  it('mirrors the backend transition matrix', () => {
    expect(ALLOWED_TRANSITIONS).toEqual({
      pending: ['in_progress', 'cancelled'],
      in_progress: ['done', 'cancelled'],
      done: [],
      cancelled: [],
    });
  });

  it('covers every work order status', () => {
    const statuses: WorkOrderStatus[] = [
      'pending',
      'in_progress',
      'done',
      'cancelled',
    ];

    for (const status of statuses) {
      expect(ALLOWED_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('has button metadata for every reachable target status', () => {
    const targets = Object.values(ALLOWED_TRANSITIONS).flat();

    for (const target of targets) {
      expect(TRANSITION_BUTTONS[target]?.label).toBeTruthy();
      expect(TRANSITION_BUTTONS[target]?.loadingLabel).toBeTruthy();
    }
  });

  it('requires confirmation only for done and cancelled', () => {
    expect(TRANSITION_BUTTONS.in_progress?.confirmMessage).toBeUndefined();
    expect(TRANSITION_BUTTONS.done?.confirmMessage).toBeTruthy();
    expect(TRANSITION_BUTTONS.cancelled?.confirmMessage).toBeTruthy();
  });
});

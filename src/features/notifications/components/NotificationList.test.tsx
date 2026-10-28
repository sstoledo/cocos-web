import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Notification } from '../types';
import { NotificationList } from './NotificationList';

const notification: Notification = {
  id: 'notification-1',
  type: 'work_order_ready',
  title: 'Orden lista',
  body: 'La orden OT-2026-000123 está lista para entregar.',
  link: '/work-orders/wo-1',
  readAt: null,
  createdAt: '2026-10-25T12:00:00.000Z',
};

describe('NotificationList', () => {
  it('renders notification cards with unread state and type badge', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NotificationList
        notifications={[notification]}
        unreadOnly={false}
        onNotificationClick={onClick}
      />
    );

    const card = screen.getByTestId('notification-card');
    expect(card).toHaveTextContent('Orden lista');
    expect(card).toHaveTextContent('Sin leer');
    expect(screen.getAllByText('Orden lista')[0]).toHaveClass('bg-primary');

    await user.click(card);
    expect(onClick).toHaveBeenCalledWith(notification);
  });

  it('uses success for purchase order notifications and keeps empty state', () => {
    const { rerender } = render(
      <NotificationList
        notifications={[{ ...notification, type: 'purchase_order_received' }]}
        unreadOnly={false}
        onNotificationClick={vi.fn()}
      />
    );

    expect(screen.getAllByText('OC recibida')[0]).toHaveClass('bg-success');

    rerender(
      <NotificationList
        notifications={[]}
        unreadOnly
        onNotificationClick={vi.fn()}
      />
    );
    expect(
      screen.getByText('No tenés notificaciones sin leer.')
    ).toBeInTheDocument();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderDrawer(props: Omit<ComponentProps<typeof Drawer>, 'children'>) {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>
        <Drawer {...props}>
          <div data-testid="drawer-content">Sidebar content</div>
        </Drawer>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function renderDrawerWithTrigger() {
  function Wrapper() {
    const [open, setOpen] = useState(false);
    return (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir menú
          </button>
          <Drawer open={open} onOpenChange={setOpen}>
            <div data-testid="drawer-content">Sidebar content</div>
          </Drawer>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(<Wrapper />);
}

describe('Drawer', () => {
  it('renders children when open', () => {
    renderDrawer({ open: true, onOpenChange: vi.fn() });

    expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
  });

  it('does not render children when closed', () => {
    renderDrawer({ open: false, onOpenChange: vi.fn() });

    expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
  });

  it('has an accessible name for the navigation dialog', () => {
    renderDrawer({ open: true, onOpenChange: vi.fn() });

    expect(
      screen.getByRole('dialog', { name: /navegación principal/i })
    ).toBeInTheDocument();
  });

  it('calls onOpenChange when the close button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    renderDrawer({ open: true, onOpenChange });

    await user.click(screen.getByRole('button', { name: /cerrar menú/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('calls onOpenChange when the backdrop is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    renderDrawer({ open: true, onOpenChange });

    const backdrop = document.querySelector('[data-testid="drawer-backdrop"]');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      await user.click(backdrop);
    }
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('closes when Escape is pressed', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    renderDrawer({ open: true, onOpenChange });

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('returns focus to the trigger button after closing', async () => {
    const user = userEvent.setup();

    renderDrawerWithTrigger();

    const trigger = screen.getByRole('button', { name: /abrir menú/i });
    await user.click(trigger);
    expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar menú/i }));
    expect(trigger).toHaveFocus();
  });
});

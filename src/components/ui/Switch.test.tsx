import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

if (typeof PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {}
  globalThis.PointerEvent = PointerEvent as typeof globalThis.PointerEvent;
}

describe('Switch', () => {
  it('renders a label and switch control', () => {
    render(<Switch label="Enable feature" />);

    expect(screen.getByText('Enable feature')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    const handleCheckedChange = vi.fn();
    render(
      <Switch
        label="Enable feature"
        checked={false}
        onCheckedChange={handleCheckedChange}
      />
    );

    await userEvent.click(screen.getByRole('switch'));

    expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('reflects checked state', () => {
    render(<Switch label="Enable feature" checked={true} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('disables the switch', () => {
    render(<Switch label="Enable feature" disabled />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Eliminar marca',
  description: 'Esta acción no se puede deshacer.',
  onConfirm: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('renders title, description and default labels when open', () => {
    render(<ConfirmDialog {...baseProps} />);

    expect(screen.getByText('Eliminar marca')).toBeInTheDocument();
    expect(
      screen.getByText('Esta acción no se puede deshacer.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar' })
    ).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<ConfirmDialog {...baseProps} open={false} />);

    expect(screen.queryByText('Eliminar marca')).not.toBeInTheDocument();
  });

  it('calls onConfirm and closes on confirm click', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on cancel click', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies destructive styling to the confirm button in danger variant', () => {
    render(<ConfirmDialog {...baseProps} variant="danger" />);

    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveClass(
      'bg-destructive'
    );
  });

  it('uses custom labels when provided', () => {
    render(
      <ConfirmDialog
        {...baseProps}
        confirmLabel="Sí, borrar"
        cancelLabel="No"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Sí, borrar' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders the page title', () => {
    render(<Header title="Productos" />);
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('does not render the title as a heading', () => {
    render(<Header title="Productos" />);

    expect(
      screen.queryByRole('heading', { name: 'Productos' })
    ).not.toBeInTheDocument();
  });

  it('shows the hamburger menu button when onMenuClick is provided', () => {
    render(<Header title="Dashboard" onMenuClick={() => {}} />);

    expect(
      screen.getByRole('button', { name: /abrir menú/i })
    ).toBeInTheDocument();
  });

  it('hides the hamburger menu button when onMenuClick is not provided', () => {
    render(<Header title="Dashboard" />);

    expect(
      screen.queryByRole('button', { name: /abrir menú/i })
    ).not.toBeInTheDocument();
  });

  it('calls onMenuClick when the hamburger button is clicked', async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();

    render(<Header title="Dashboard" onMenuClick={onMenuClick} />);

    await user.click(screen.getByRole('button', { name: /abrir menú/i }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('does not render theme toggle or user menu controls', () => {
    render(<Header title="Dashboard" />);

    expect(
      screen.queryByRole('button', { name: /toggle theme/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cerrar sesión/i })
    ).not.toBeInTheDocument();
  });
});

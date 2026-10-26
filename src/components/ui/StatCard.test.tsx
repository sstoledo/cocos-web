import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard } from './StatCard';

function DollarIcon({ className }: { className?: string }) {
  return (
    <span data-testid="stat-icon" className={className}>
      $
    </span>
  );
}

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Ventas" value={123} />);

    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<StatCard label="Estado" value="Activo" />);

    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('renders an optional icon', () => {
    render(<StatCard label="Ingresos" value="$1.2k" icon={DollarIcon} />);

    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(
      <StatCard label="Clientes" value={42} description="Nuevos este mes" />
    );

    expect(screen.getByText('Nuevos este mes')).toBeInTheDocument();
  });

  it('renders the approved icon, typography and navigation treatment', () => {
    render(
      <StatCard label="Ventas" value={123} icon={DollarIcon} showNavigation />
    );

    const icon = screen.getByTestId('stat-icon');
    expect(icon).toHaveClass('text-primary');
    expect(icon.parentElement).toHaveClass('h-9', 'w-9', 'bg-muted');
    expect(screen.getByText('Ventas')).toHaveClass(
      'text-body-sm',
      'text-muted-foreground'
    );
    expect(screen.getByText('123')).toHaveClass(
      'font-display',
      'text-h1',
      'font-semibold'
    );
    expect(screen.getByTestId('stat-card-navigation')).toBeInTheDocument();
  });

  it('uses the bordered elevated card treatment', () => {
    const { container } = render(<StatCard label="Ventas" value={123} />);

    expect(container.firstElementChild).toHaveClass(
      'border',
      'rounded-lg',
      'shadow-stat'
    );
    expect(
      screen.queryByTestId('stat-card-navigation')
    ).not.toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <StatCard label="Test" value={0} className="custom-stat-class" />
    );

    expect(container.firstElementChild).toHaveClass('custom-stat-class');
  });
});

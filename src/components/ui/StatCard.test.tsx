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

  it('applies a custom className', () => {
    const { container } = render(
      <StatCard label="Test" value={0} className="custom-stat-class" />
    );

    expect(container.firstElementChild).toHaveClass('custom-stat-class');
  });
});

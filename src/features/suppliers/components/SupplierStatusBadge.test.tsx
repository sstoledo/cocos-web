import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SupplierStatusBadge } from './SupplierStatusBadge';

describe('SupplierStatusBadge', () => {
  it('renders active badge', () => {
    render(<SupplierStatusBadge isActive={true} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toHaveClass('bg-green-100');
  });

  it('renders inactive badge', () => {
    render(<SupplierStatusBadge isActive={false} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toHaveClass('bg-gray-100');
  });
});

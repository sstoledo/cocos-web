import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders with htmlFor and children', () => {
    render(<Label htmlFor="email">Email address</Label>);

    const label = screen.getByText('Email address');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'email');
  });

  it('applies a custom className', () => {
    render(<Label className="custom-label-class">Name</Label>);

    expect(screen.getByText('Name')).toHaveClass('custom-label-class');
  });

  it('reflects disabled and error states', () => {
    render(
      <Label htmlFor="input" disabled error>
        Error label
      </Label>
    );

    const label = screen.getByText('Error label');
    expect(label).toHaveClass('opacity-50');
    expect(label).toHaveClass('text-destructive');
  });
});

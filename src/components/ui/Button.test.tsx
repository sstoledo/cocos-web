import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('applies the danger variant classes', () => {
    render(<Button variant="danger">Eliminar</Button>);

    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveClass(
      'bg-destructive'
    );
  });

  it('applies the ghost variant classes', () => {
    render(<Button variant="ghost">Cancelar</Button>);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass(
      'hover:bg-muted'
    );
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('renders children as a heading', () => {
    render(<PageTitle>Clientes</PageTitle>);

    const title = screen.getByRole('heading', { name: 'Clientes' });
    expect(title).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(<PageTitle className="custom-title-class">Productos</PageTitle>);

    expect(screen.getByRole('heading', { name: 'Productos' })).toHaveClass(
      'custom-title-class'
    );
  });
});

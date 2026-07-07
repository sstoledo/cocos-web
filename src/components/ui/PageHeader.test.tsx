import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders children', () => {
    render(
      <PageHeader>
        <span data-testid="page-header-child">Clients</span>
      </PageHeader>
    );

    expect(screen.getByTestId('page-header-child')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(
      <PageHeader className="custom-header-class">
        <span>Title</span>
      </PageHeader>
    );

    expect(screen.getByText('Title').parentElement).toHaveClass(
      'custom-header-class'
    );
  });
});

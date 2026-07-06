import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageContent } from './PageContent';

describe('PageContent', () => {
  it('renders children', () => {
    render(
      <PageContent>
        <span data-testid="page-content-child">Content</span>
      </PageContent>
    );

    expect(screen.getByTestId('page-content-child')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(
      <PageContent className="custom-content-class">
        <span>Body</span>
      </PageContent>
    );

    expect(screen.getByText('Body').parentElement).toHaveClass(
      'custom-content-class'
    );
  });
});

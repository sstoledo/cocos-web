import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  it('renders title and children', () => {
    render(
      <SectionCard title="Actividad reciente">
        <span data-testid="section-child">Empty state</span>
      </SectionCard>
    );

    expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
    expect(screen.getByTestId('section-child')).toBeInTheDocument();
  });

  it('renders the title as a heading', () => {
    render(<SectionCard title="Detalles">Children</SectionCard>);

    expect(
      screen.getByRole('heading', { name: 'Detalles' })
    ).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <SectionCard title="Test" className="custom-section-class">
        Body
      </SectionCard>
    );

    expect(container.firstElementChild).toHaveClass('custom-section-class');
  });
});
